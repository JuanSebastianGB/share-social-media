import { setName } from '@/redux/states/userSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
export interface GiveNameInterface {}

const GiveName: React.FC<GiveNameInterface> = () => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setName('Updated name'));
  };
  return <button onClick={handleClick}>GiveName</button>;
};

export default GiveName;
