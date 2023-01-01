import { Error } from '@/components/Error';
import { makeLogin, makeLogout } from '@/redux/states/authSlice';
import { fetchLogin } from '@/services/login';
import {
  errorToastMessageConfig,
  successToastMessageConfig,
} from '@/utilities';
import {
  Box,
  Button,
  Grid,
  GridProps,
  Paper,
  styled,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
export interface LoginInterface {}

const StyledForm = styled(Grid)<GridProps>(({ theme }) => ({
  '& .form': {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '4rem  0',
  },
}));

const Login: React.FC<LoginInterface> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ data: '', status: 0, statusText: '' });

  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetchLogin({ email, password });
      const { userFound: user, token } = response.data;
      toast.success(`(●'◡'●) Logged in!`, successToastMessageConfig);
      dispatch(makeLogin({ user, token }));
    } catch (error: any) {
      const { data, status, statusText } = error.response;
      setError({ data, status, statusText });
      toast.error('😑😑 Something went wrong!', errorToastMessageConfig);
      dispatch(makeLogout({}));
      setTimeout(() => {
        setError({ data: '', status: 0, statusText: '' });
      }, 2000);
    }
  };
  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Paper
          sx={{
            height: '400px',
            width: '300px',
            margin: '0 auto',
          }}
          elevation={3}
        >
          {error?.data && (
            <ul>
              {error?.data?.errors ? (
                <Error errorList={error?.data?.errors} />
              ) : (
                <Error errorString={error.data} />
              )}
            </ul>
          )}
          <StyledForm>
            <form className="form" onSubmit={handleSubmit}>
              <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="email"
                variant="outlined"
              />
              <TextField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="password"
                variant="outlined"
                type={'password'}
              />
              <Button
                sx={{
                  width: '80%',
                }}
                type="submit"
                variant="contained"
              >
                Login
              </Button>
            </form>
          </StyledForm>
        </Paper>
      </Box>
    </div>
  );
};

export default Login;
