import { loginInitialValues, LoginModel } from '@/models';
import { loginSchema } from '@/schemas';
import { Button, TextField } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
export interface Props {}

const onSubmit = (values: LoginModel, onSubmitProps: any) => {
  console.log(values);
};

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
  } = useFormik({
    onSubmit,
    initialValues: loginInitialValues,
    validationSchema: loginSchema,
  });
  return (
    <>
      <form onSubmit={handleSubmit}>
        <TextField
          {...getFieldProps('email')}
          label="Email"
          helperText={errors.email && touched.email && errors.email}
          error={!!errors.email && touched.email}
          onBlur={handleBlur}
        />
        <TextField
          {...getFieldProps('password')}
          label="Password"
          helperText={errors.password && touched.password && errors.password}
          error={!!errors.password && touched.password}
          onBlur={handleBlur}
        />

        <Button type="submit">Login</Button>
      </form>
    </>
  );
};

export default AuthLogin;
