import { Button, TextField } from '@mui/material';
import { FieldInputProps } from 'formik';
import React from 'react';
export interface Props {
  getFieldProps: (nameOrOptions: any) => FieldInputProps<any>;
  errors: any;
  handleBlur: any;
  touched: any;
  handleSubmit: any;
}

const AuthLoginForm: React.FC<Props> = ({
  getFieldProps,
  errors,
  handleBlur,
  touched,
  handleSubmit,
}) => {
  return (
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

      <Button type="submit" variant="contained">
        Login
      </Button>
    </form>
  );
};

export default AuthLoginForm;
