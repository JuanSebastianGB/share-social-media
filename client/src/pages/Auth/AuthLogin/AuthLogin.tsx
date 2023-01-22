import { ErrorContent, Spinner } from '@/components';
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
    handleBlur,
    error,
    isError,
    isLoading,
    displayButton,
  } = useLogin();

  if (isLoading) return <Spinner />;
  if (isError)
    return (
      <ErrorContent
        // @ts-ignore
        message={error?.error?.message}
        // @ts-ignore
        data={error?.error?.response.data}
      />
    );

  return (
    <AuthLoginForm
      getFieldProps={getFieldProps}
      errors={errors}
      handleBlur={handleBlur}
      touched={touched}
      handleSubmit={handleSubmit}
      displayButton={displayButton}
    />
  );
};

export default AuthLogin;
