import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faPhone, 
    faVideo, 
    faEllipsisV, 
    faPaperclip, 
    faMicrophone, 
    faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabaseClient';

const Chat = ({ session, userData, pendingConversation }) => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const userDefaultAvatar = userData?.avatarUrl || session?.user?.user_metadata?.avatar_url;
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [conversationLastMessages, setConversationLastMessages] = useState({});
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchConversations();
            
            // Subscribe conversations mới
            const convSubscription = supabase
                .channel('public:conversations')
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'conversations',
                    filter: `user1_id=eq.${session.user.id}`
                }, () => fetchConversations())
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'conversations',
                    filter: `user2_id=eq.${session.user.id}`
                }, () => fetchConversations())
                .subscribe();

            return () => {
                supabase.removeChannel(convSubscription);
            };
        }
    }, [session?.user?.id]);

    // Subscribe messages khi conversation thay đổi
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);

            const msgSubscription = supabase
                .channel(`public:messages:conversation_id=eq.${selectedConversation.id}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `conversation_id=eq.${selectedConversation.id}`
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                    // cap nhật last message cho conversation này
                    setConversationLastMessages(prev => ({
                        ...prev,
                        [selectedConversation.id]: payload.new
                    }));
                })
                .subscribe();

            return () => {
                supabase.removeChannel(msgSubscription);
            };
        } else {
            setMessages([]);
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (pendingConversation && conversations.length > 0) {
            // Find the conversation by ID
            const conv = conversations.find(c => c.id === pendingConversation.conversationId);
            if (conv) {
                const otherUser = getOtherUser(conv);
                setSelectedConversation({
                    ...conv,
                    otherUser: otherUser
                });
            }
        }
    }, [pendingConversation, conversations]);

    const fetchConversations = async () => {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                user1:user1_id (id, full_name, avatar_url, email),
                user2:user2_id (id, full_name, avatar_url, email)
            `)
            .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching conversations:', error);
        else {
            setConversations(data);
            
            if (data && data.length > 0) {
                const conversationIds = data.map(conv => conv.id);
                const { data: messages, error: msgError } = await supabase
                    .from('messages')
                    .select('*')
                    .in('conversation_id', conversationIds)
                    .order('created_at', { ascending: false });
                
                if (!msgError && messages) {
                    const lastMessages = {};
                    messages.forEach(msg => {
                        if (!lastMessages[msg.conversation_id]) {
                            lastMessages[msg.conversation_id] = msg;
                        }
                    });
                    setConversationLastMessages(lastMessages);
                }
            }
        }
    };

    const fetchMessages = async (conversationId) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching messages:', error);
        else setMessages(data);
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length > 1) {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, avatar_url, email')
                .neq('id', session.user.id)
                .ilike('full_name', `%${value}%`)
                .limit(5);
            
            if (error) console.error('Error searching users:', error);
            else setSearchResults(data);
            setLoading(false);
        } else {
            setSearchResults([]);
        }
    };

    const startConversation = async (otherUser) => {
        const user1_id = session.user.id < otherUser.id ? session.user.id : otherUser.id;
        const user2_id = session.user.id < otherUser.id ? otherUser.id : session.user.id;

        // Check if conversation already exists
        let { data: existingConv } = await supabase
            .from('conversations')
            .select('*')
            .or(`and(user1_id.eq.${user1_id},user2_id.eq.${user2_id})`)
            .maybeSingle();

        if (existingConv) {
            setSelectedConversation({
                ...existingConv,
                otherUser: otherUser
            });
            setSearchTerm('');
            setSearchResults([]);
            return;
        }

        // tạo conversation mới
        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert([
                { user1_id, user2_id }
            ])
            .select()
            .single();

        if (createError) {
            console.error('Error creating conversation:', createError);
            alert('Lỗi tạo cuộc trò chuyện. Vui lòng kiểm tra RLS Policy trên Supabase.');
        } else {
            setSelectedConversation({
                ...newConv,
                otherUser: otherUser
            });
            fetchConversations();
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const messageData = { 
            conversation_id: selectedConversation.id, 
            sender_id: session.user.id, 
            content: newMessage,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('messages')
            .insert([messageData])
            .select()
            .single();

        if (error) console.error('Error sending message:', error);
        else {
            setNewMessage('');
            if (data) {
                setConversationLastMessages(prev => ({
                    ...prev,
                    [selectedConversation.id]: data
                }));
            }
        }
    };

    const getOtherUser = (conv) => {
        return conv.user1_id === session.user.id ? conv.user2 : conv.user1;
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const utcDate = new Date(dateString);
        // Cộng thêm 7 tiếng (7 * 60 * 60 * 1000 miliseconds) để chuyển từ UTC sang UTC+7
        const vnDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
        return vnDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatLastMessage = (conv) => {
        const lastMsg = conversationLastMessages[conv.id];
        
        if (!lastMsg) {
            return "Hãy gửi tin nhắn cho nhau!";
        }
        
        const isMe = lastMsg.sender_id === session.user.id;
        const messageText = lastMsg.content;
        
        if (isMe) {
            return `Bạn: ${messageText}`;
        } else {
            return messageText;
        }
    };

    return (
        <div className="chat-container">
            {/* Sidebar List */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <div className="chat-app-logo">
                        E-Chat
                    </div>
                    <div className="chat-search-container">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search people..." 
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {searchTerm && (
                            <div className="search-results-dropdown">
                                {loading ? (
                                    <div className="search-item">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <div key={user.id} className="search-item" onClick={() => startConversation(user)}>
                                            <img src={user.avatar_url} alt={user.full_name} />
                                            <span>{user.full_name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="search-item">No users found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="chat-list-section">
                    <div className="chat-list-label">ALL MESSAGES</div>
                    {conversations.map(conv => {
                        const otherUser = getOtherUser(conv);
                        return (
                            <div 
                                key={conv.id} 
                                className={`chat-list-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                                onClick={() => setSelectedConversation({...conv, otherUser})}
                            >
                                <div className="chat-avatar">
                                    <img src={otherUser?.avatar_url} alt={otherUser?.full_name} />
                                </div>
                                <div className="chat-info">
                                    <div className="chat-name-row">
                                        <span className="chat-name">{otherUser?.full_name}</span>
                                        <span className="chat-time">
                                            {formatTime(conv.created_at)}
                                        </span>
                                    </div>
                                    <div className="chat-msg-row">
                                        <span className="chat-last-msg">{formatLastMessage(conv)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {selectedConversation ? (
                    <>
                        <div className="chat-window-header">
                            <div className="header-user-info">
                                <div className="header-avatar">
                                    <img src={selectedConversation.otherUser?.avatar_url} alt={selectedConversation.otherUser?.full_name} />
                                </div>
                                <div className="header-text">
                                    <div className="header-name">{selectedConversation.otherUser?.full_name}</div>
                                    <div className="header-status">Online</div>
                                </div>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.map(msg => {
                                const isMe = msg.sender_id === session.user.id;
                                return (
                                    <div key={msg.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
                                        {!isMe && (
                                            <div className="msg-avatar">
                                                <img src={selectedConversation.otherUser?.avatar_url} alt={selectedConversation.otherUser?.full_name} />
                                            </div>
                                        )}
                                        <div className="message-bubble">
                                            {!isMe && <div className="sender-name">{selectedConversation.otherUser?.full_name} <span className="time">{formatTime(msg.created_at)}</span></div>}
                                            <div className="message-text">{msg.content}</div>
                                            {isMe && (
                                                <div className="me-meta">
                                                    <span className="time">{formatTime(msg.created_at)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {isMe && (
                                            <div className="msg-avatar">
                                                <img src={userDefaultAvatar}alt="User Avatar"/>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={sendMessage}>
                            <div className="input-container">
                                <input 
                                    type="text" 
                                    placeholder="Type message..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="button" className="input-aux-btn"><FontAwesomeIcon icon={faMicrophone} /></button>
                                <button type="button" className="input-aux-btn"><FontAwesomeIcon icon={faPaperclip} /></button>
                            </div>
                            <button type="submit" className="send-btn">
                                <span>Send</span>
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="no-chat-content">
                            <h3>Select a conversation to start chatting</h3>
                            <p>Search for people to start a new chat</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;