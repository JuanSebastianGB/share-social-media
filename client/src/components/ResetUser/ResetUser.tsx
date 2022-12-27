import { reset } from '@/redux/states/userSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
export interface ResetUserInterface {}

const ResetUser: React.FC<ResetUserInterface> = () => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(reset());
  };
  return <button onClick={handleClick}>ResetUser</button>;
};

export default ResetUser;
