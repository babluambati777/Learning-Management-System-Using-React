import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/Dashboard" className="navbar-logo">
          <span className="logo-icon">📚</span>
          Simple LMS
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/Dashboard" className={`navbar-link ${isActive('/')}`}>
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/batches" className={`navbar-link ${isActive('/batches')}`}>
              Batches
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/students" className={`navbar-link ${isActive('/students')}`}>
              Students
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/marks" className={`navbar-link ${isActive('/marks')}`}>
              Marks
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;