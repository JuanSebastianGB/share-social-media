import { Paper, styled } from '@mui/material';

export const StyledRegisterAuth = styled(Paper)(({ theme }) => ({
  width: '70%',
  margin: '0 auto',
  padding: '2rem',
  marginTop: '3rem',

  '.link': {
    textDecoration: 'none',
    color: theme.palette.primary.light,
    gridColumn: 'span 4',
    margin: '1rem 0',
    textAlign: 'center',
  },
}));
