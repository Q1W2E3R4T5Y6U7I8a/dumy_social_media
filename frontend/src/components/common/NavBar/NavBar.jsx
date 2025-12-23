import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import './NavBar.scss';
import { auth } from '../../../firebase.js';

const Navbar = () => {
  const { currentUser } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <Link to="/" className="navbar__logo">
          <img src={`/DUMY_logo.png`} alt="DUMY Logo" className="navbar__logo-image" />
        </Link>
      </div>

      <div className="navbar__center">
        <Link to="dumy" className="navbar__link">DUMY</Link>
        <Link to="books" className="navbar__link">BOOK_CROSS</Link>
        <Link to="duma" className="navbar__link">DUMA</Link>
      </div>

      <div className="navbar__right">
        <Link to={`account/${auth.currentUser?.uid}`} className="navbar__user-icon">
        <img
          src={`${currentUser?.photoURL || '/no_avatar.png'}`}
          alt="Profile"
          className="navbar__profile-pic"
        />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;