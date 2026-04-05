import React, { useState } from 'react';
import './Chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faPlus, 
    faPhone, 
    faVideo, 
    faEllipsisV, 
    faSmile, 
    faPaperclip, 
    faMicrophone, 
    faPaperPlane,
    faCheckDouble
} from '@fortawesome/free-solid-svg-icons';

const Chat = ({ session, userData }) => {
    const [selectedChat, setSelectedChat] = useState(3); // Default to Grace Miller based on image
    const [message, setMessage] = useState('');

    const chats = [
        { id: 1, name: 'Liam Anderson', avatar: 'https://i.pravatar.cc/150?u=liam', lastMsg: 'Typing...', time: '04:50 PM', status: 'typing', pinned: true },
        { id: 2, name: 'Lucas Williams', avatar: 'https://i.pravatar.cc/150?u=lucas', lastMsg: 'Hey, how\'s it going?', time: '10:30 AM', unread: 2, pinned: true },
        { id: 3, name: 'Grace Miller', avatar: 'https://i.pravatar.cc/150?u=grace', lastMsg: 'Can\'t wait for the weekend!', time: '10:25 AM', online: true, pinned: true },
        { id: 4, name: 'Sophia Chen', avatar: 'https://i.pravatar.cc/150?u=sophia', lastMsg: 'Remember that concert last y...', time: '07:23 PM' },
        { id: 5, name: 'Benjamin Knight', avatar: 'https://i.pravatar.cc/150?u=ben', lastMsg: 'Just got back from a hiking trip!', time: '08:45 PM', unread: 1 },
        { id: 6, name: 'Olivia Foster', avatar: 'https://i.pravatar.cc/150?u=olivia', lastMsg: 'Excited for the upcoming vac...', time: 'Yesterday' },
        { id: 7, name: 'Jackson Adams', avatar: 'https://i.pravatar.cc/150?u=jackson', lastMsg: 'Looking forward to the weekend...', time: 'Yesterday' },
        { id: 8, name: 'Ethan Sullivan', avatar: 'https://i.pravatar.cc/150?u=ethan', lastMsg: 'Finished reading a captivating no...', time: 'Yesterday' },
    ];

    const messages = [
        { id: 1, text: "Hey Grace, how's it going?", time: "10:30 AM", sender: 'me' },
        { id: 2, text: "Hi Jack! I'm doing well, thanks. Can't wait for the weekend!", time: "10:31 AM", sender: 'them' },
        { id: 3, text: "I know, right? Weekend plans are the best. Any exciting plans on your end?", time: "10:32 AM", sender: 'me' },
        { id: 4, text: "Absolutely! I'm thinking of going for a hike on Saturday. How about you?", time: "10:33 AM", sender: 'them' },
        { id: 5, text: "Hiking sounds amazing! I might catch up on some reading and also meet up with a few friends on Sunday.", time: "10:34 AM", sender: 'me' },
        { id: 6, text: "That sounds like a great plan! Excited 😄", time: "10:35 AM", sender: 'them' },
        { id: 7, text: "Can't wait for the weekend!", time: "10:36 AM", sender: 'me' },
    ];

    const activeChat = chats.find(c => c.id === selectedChat);

    return (
        <div className="chat-container">
            {/* Sidebar List */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <div className="chat-app-logo">
                        <div className="chat-logo-icon">💬</div>
                        Chat Buddies
                    </div>
                    <div className="chat-search-container">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input type="text" placeholder="Search messages, people" />
                        <button className="add-chat-btn">
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                </div>

                <div className="chat-list-section">
                    <div className="chat-list-label">📌 PINNED CHATS</div>
                    {chats.filter(c => c.pinned).map(chat => (
                        <div 
                            key={chat.id} 
                            className={`chat-list-item ${selectedChat === chat.id ? 'active' : ''}`}
                            onClick={() => setSelectedChat(chat.id)}
                        >
                            <div className="chat-avatar">
                                <img src={chat.avatar} alt={chat.name} />
                                {chat.online && <div className="status-dot online"></div>}
                            </div>
                            <div className="chat-info">
                                <div className="chat-name-row">
                                    <span className="chat-name">{chat.name}</span>
                                    <span className="chat-time">{chat.time}</span>
                                </div>
                                <div className="chat-msg-row">
                                    <span className={`chat-last-msg ${chat.status === 'typing' ? 'typing' : ''}`}>
                                        {chat.status === 'typing' ? 'Typing...' : chat.lastMsg}
                                    </span>
                                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="chat-list-label">📁 ALL MESSAGES</div>
                    {chats.filter(c => !c.pinned).map(chat => (
                        <div 
                            key={chat.id} 
                            className={`chat-list-item ${selectedChat === chat.id ? 'active' : ''}`}
                            onClick={() => setSelectedChat(chat.id)}
                        >
                            <div className="chat-avatar">
                                <img src={chat.avatar} alt={chat.name} />
                                {chat.online && <div className="status-dot online"></div>}
                            </div>
                            <div className="chat-info">
                                <div className="chat-name-row">
                                    <span className="chat-name">{chat.name}</span>
                                    <span className="chat-time">{chat.time}</span>
                                </div>
                                <div className="chat-msg-row">
                                    <span className="chat-last-msg">{chat.lastMsg}</span>
                                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                <div className="chat-window-header">
                    <div className="header-user-info">
                        <div className="header-avatar">
                            <img src={activeChat?.avatar} alt={activeChat?.name} />
                            {activeChat?.online && <div className="status-dot online"></div>}
                        </div>
                        <div className="header-text">
                            <div className="header-name">{activeChat?.name}</div>
                            <div className="header-status">{activeChat?.online ? 'Online' : 'Offline'}</div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="action-btn"><FontAwesomeIcon icon={faPhone} /></button>
                        <button className="action-btn"><FontAwesomeIcon icon={faVideo} /></button>
                        <button className="action-btn"><FontAwesomeIcon icon={faEllipsisV} /></button>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message-row ${msg.sender}`}>
                            {msg.sender === 'them' && (
                                <div className="msg-avatar">
                                    <img src={activeChat?.avatar} alt={activeChat?.name} />
                                </div>
                            )}
                            <div className="message-bubble">
                                {msg.sender === 'them' && <div className="sender-name">{activeChat?.name} <span className="time">{msg.time}</span></div>}
                                <div className="message-text">{msg.text}</div>
                                {msg.sender === 'me' && (
                                    <div className="me-meta">
                                        <span className="time">{msg.time}</span>
                                        <span className="name">Jack Raymonds</span>
                                    </div>
                                )}
                            </div>
                            {msg.sender === 'me' && (
                                <div className="msg-avatar">
                                    <img src="https://i.pravatar.cc/150?u=jack" alt="me" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="chat-input-area">
                    <div className="input-container">
                        <button className="input-aux-btn"><FontAwesomeIcon icon={faSmile} /></button>
                        <input 
                            type="text" 
                            placeholder="Type message..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className="input-aux-btn"><FontAwesomeIcon icon={faMicrophone} /></button>
                        <button className="input-aux-btn"><FontAwesomeIcon icon={faPaperclip} /></button>
                    </div>
                    <button className="send-btn">
                        <span>Send</span>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;