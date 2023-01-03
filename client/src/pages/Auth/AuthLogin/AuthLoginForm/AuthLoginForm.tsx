import { Button, Paper, styled, TextField, Typography } from '@mui/material';
import { FieldInputProps } from 'formik';
import React from 'react';

const StyledAuthLogin = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '70%',
  height: '80vh',
  margin: '0 auto',
  '& .form': {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '& .input': {
    width: '100%',
    margin: theme.spacing(1),
  },
}));

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
    <StyledAuthLogin elevation={5}>
      <Typography variant="h4" gutterBottom my={6} align="center">
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
        <Button type="submit" variant="contained" fullWidth>
          Login
        </Button>
      </form>
    </StyledAuthLogin>
  );
};

export default AuthLoginForm;
