import userAvatar from '../assets/img/user.jpg';

const Header = () => {
    return (
        <header className="header">
            <h1>Hi, Hồ Hải! </h1>
            <div className="header-right">
                <span className="header-icon">🔍</span>
                <span className="header-icon">🔔</span>
                <div className="user-avatar">
                   <img 
                    src={userAvatar}
                    alt="User Avatar"
                    style={{ width: '32px',height: '32px',marginTop:7,borderRadius: '50%', cursor: 'pointer' }}
                   />
                </div>
            </div>
        </header>
    );
}

export default Header;
