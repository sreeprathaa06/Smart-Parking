import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMapPin, FiUser, FiLogOut, FiMenu, FiX, FiActivity } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active-link' : '';
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Smart<span>Park</span>
        </Link>
        <nav className="navbar-links">
          <Link to="/parking" className={isActive('/parking')}>
            <FiMapPin /> Find Parking
          </Link>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className={isActive('/admin')}>
                  <FiActivity /> Dashboard
                </Link>
              )}
              <Link to="/my-bookings" className={isActive('/my-bookings')}>
                <FiUser /> My Bookings
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary nav-btn">
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/register" className="btn btn-primary nav-btn">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
