import { Paper, styled } from '@mui/material';

export const StyledAuthLogin = styled(Paper)(({ theme }) => ({
  width: '400px',
  height: '370px',
  margin: '0 auto',
  padding: '2rem',
  '.form': {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
  },
  '& .input': {
    width: '90%',
    margin: theme.spacing(1),
  },
  '.login-button': {
    width: '90%',
    margin: theme.spacing(1),
  },
}));
