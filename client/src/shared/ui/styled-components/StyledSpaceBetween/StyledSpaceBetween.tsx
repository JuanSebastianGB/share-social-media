import { Box, styled } from '@mui/material';

export const StyledFlexBetween = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '.icon': { fontSize: '25px', color: theme.palette.neutral.dark },
  margin: '1rem',
}));

export const SpaceBetween = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));
export const SpaceBetweenColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  textAlign: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'column',
}));
