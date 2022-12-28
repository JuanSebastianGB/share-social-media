import React from 'react';
import { Link } from 'react-router-dom';
export interface NavbarInterface {}

const Navbar: React.FC<NavbarInterface> = () => {
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/profile/1">Profile</Link>
    </div>
  );
};

export default Navbar;
