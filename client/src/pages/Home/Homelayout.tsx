import { Box, styled } from '@mui/material';
import { FC, ReactNode } from 'react';

const StyledHome = styled(Box)(({ theme }) => ({
  width: '100%',
  background: theme.palette.background.default,
  minHeight: '100vh',
  '& section': {
    display: 'flex',
    padding: '0.5rem',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    maxWidth: '90%',
    margin: '0 auto',
    gap: '1rem',
  },
  [theme.breakpoints.down('md')]: {
    '& section': {
      display: 'flex',
      padding: '0.5rem',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'column',
      maxWidth: '95%',
      margin: '0 auto',
      gap: null,
    },
  },
}));

interface Props {
  children: ReactNode;
}
const HomeContainer: FC<Props> = ({ children }) => {
  return <StyledHome>{children}</StyledHome>;
};

export default HomeContainer;
