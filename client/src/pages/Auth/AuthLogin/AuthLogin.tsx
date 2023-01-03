import { Error } from '@/components';
import { useLogin } from '@/hooks';
import React from 'react';
import { AuthLoginForm } from './AuthLoginForm';
export interface Props {}

const AuthLogin: React.FC<Props> = () => {
  const {
    handleSubmit,
    getFieldProps,
    errors,
    touched,
    dirty,
    isValid,
    resetForm,
    handleBlur,
    error,
  } = useLogin();
  return (
    <>
      <AuthLoginForm
        getFieldProps={getFieldProps}
        errors={errors}
        handleBlur={handleBlur}
        touched={touched}
        handleSubmit={handleSubmit}
      />
      {error?.data && (
        <ul>
          {error?.data?.errors ? (
            <Error errorList={error?.data?.errors} />
          ) : (
            <Error errorString={error.data} />
          )}
        </ul>
      )}
    </>
  );
};

export default AuthLogin;