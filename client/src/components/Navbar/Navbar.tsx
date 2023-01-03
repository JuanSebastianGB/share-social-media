import { AppStore } from '@/models';
import { makeLogout } from '@/redux/states/authSlice';
import { Button } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
export interface NavbarInterface {}

const Navbar: React.FC<NavbarInterface> = () => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(makeLogout({}));
  };
  const token = useSelector((store: AppStore) => store.auth?.token);
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/auth">Auth</Link>
      <Link to="/profile/1">Profile</Link>

      <Button onClick={handleLogout} variant="outlined">
        Logout
      </Button>
    </div>
  );
};

export default Navbar;
