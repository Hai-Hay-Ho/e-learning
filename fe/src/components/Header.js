import userAvatar from '../assets/img/user.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    return (
        <header className="header">
            <h1>Hi, Hồ Hải! </h1>
            <div className="header-right">
                <span className="header-icon"><FontAwesomeIcon icon={faSearch} /></span>
                <span className="header-icon"><FontAwesomeIcon icon={faBell} /></span>
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
