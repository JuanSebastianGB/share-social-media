import { Navbar } from '@/components';
import React from 'react';
export interface HomeInterface {}

const Home: React.FC<HomeInterface> = () => {
  return (
    <div>
      <Navbar />
      Home component
    </div>
  );
};

export default Home;
