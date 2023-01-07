import { Button, TextField, Typography } from '@mui/material';
import { FieldInputProps } from 'formik';
import React from 'react';
import { StyledAuthLogin } from './styles';

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
    <StyledAuthLogin elevation={7}>
      <Typography variant="h4" gutterBottom align="center">
        Login
      </Typography>
      <form onSubmit={handleSubmit} className="form">
        <TextField
          className="input"
          {...getFieldProps('email')}
          label="Email"
          helperText={errors.email && touched.email && errors.email}
          error={!!errors.email && touched.email}
          onBlur={handleBlur}
        />
        <TextField
          className="input"
          {...getFieldProps('password')}
          label="Password"
          helperText={errors.password && touched.password && errors.password}
          error={!!errors.password && touched.password}
          onBlur={handleBlur}
        />
        <Button type="submit" variant="contained" className="login-button">
          Login
        </Button>
      </form>
    </StyledAuthLogin>
  );
};

export default AuthLoginForm;
