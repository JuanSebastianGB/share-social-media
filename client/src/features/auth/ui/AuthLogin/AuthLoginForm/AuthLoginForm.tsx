import { Box, Button, TextField, useMediaQuery } from '@mui/material';
import type { FormikProps } from 'formik';
import type { LoginModel } from '@/models';
import React from 'react';
import { Link } from 'react-router-dom';
import { StyledAuthLogin } from './styles';

type FormikLogin = FormikProps<LoginModel>;

export interface Props {
  getFieldProps: FormikLogin['getFieldProps'];
  errors: FormikLogin['errors'];
  handleBlur: FormikLogin['handleBlur'];
  touched: FormikLogin['touched'];
  handleSubmit: FormikLogin['handleSubmit'];
  displayButton: boolean;
}

const AuthLoginForm: React.FC<Props> = ({
  getFieldProps,
  errors,
  handleBlur,
  touched,
  handleSubmit,
  displayButton,
}) => {
  const isMobileScreen = useMediaQuery('(max-width: 800px)');
  return (
    <StyledAuthLogin
      elevation={7}
      sx={{
        width: isMobileScreen ? '93%' : '50%',
      }}
    >
      <Box component="form" onSubmit={handleSubmit} className="form">
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
          type="password"
          autoComplete="off"
          helperText={errors.password && touched.password && errors.password}
          error={!!errors.password && touched.password}
          onBlur={handleBlur}
        />
        {displayButton && (
          <Button type="submit" variant="contained" className="login-button">
            Login
          </Button>
        )}

        <Link to="/register" className="link">
          Don't have an account? Sign Up here.
        </Link>
      </Box>
    </StyledAuthLogin>
  );
};

export default AuthLoginForm;