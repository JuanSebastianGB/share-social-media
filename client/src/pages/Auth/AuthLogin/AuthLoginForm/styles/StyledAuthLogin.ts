import { Paper, styled } from '@mui/material';

export const StyledAuthLogin = styled(Paper)(({ theme }) => ({
  width: '50%',
  margin: '0 auto',
  padding: '2rem',
  marginTop: '3rem',

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
  '.link': {
    textDecoration: 'none',
    color: theme.palette.primary.light,
    margin: '1rem 0',
    textAlign: 'center',
  },
}));
