import { useLogin } from '@/hooks';
import Typography from '@mui/material/Typography';
import React from 'react';
import { AuthLoginForm } from './AuthLoginForm';
export interface Props {}

const AuthLogin: React.FC<Props> = () => {
  const {
    handleSubmit,
    getFieldProps,
    errors,
    touched,
    handleBlur,
    error,
    displayButton,
  } = useLogin();
  return (
    <>
      <AuthLoginForm
        getFieldProps={getFieldProps}
        errors={errors}
        handleBlur={handleBlur}
        touched={touched}
        handleSubmit={handleSubmit}
        displayButton={displayButton}
      />
      {error?.data && (
        <Typography variant="body1" color="initial">
          something went wrong
        </Typography>
      )}
    </>
  );
};

export default AuthLogin;
