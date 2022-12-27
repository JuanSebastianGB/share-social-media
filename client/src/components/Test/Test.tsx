import { AppStore } from '@/models';
import React from 'react';
import { useSelector } from 'react-redux';
export interface TestInterface {}

const Test: React.FC<TestInterface> = () => {
  const user = useSelector((store: AppStore) => store.user);

  return <div>{JSON.stringify(user)}</div>;
};

export default Test;
