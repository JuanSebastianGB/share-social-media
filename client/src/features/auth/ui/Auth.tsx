import { Button } from '@mui/material';
import React, { useState } from 'react';
import { AuthLogin } from './AuthLogin';
import { AuthRegister } from './AuthRegister';
export interface AuthInterface {}

const Auth: React.FC<AuthInterface> = () => {
  const [isLoginNotRegisterForm, setIsLoginNotRegisterForm] = useState(true);

  return (
    <>
      <p>
        <Button onClick={(e) => setIsLoginNotRegisterForm((data) => !data)}>
          Change
        </Button>
      </p>

      {isLoginNotRegisterForm ? <AuthLogin /> : <AuthRegister />}
    </>
  );
};

export default Auth;
