import { Box, styled } from "@mui/material";

export const StyledFlexBetween = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '.icon': { fontSize: '25px', color: '#e1e0e1' },
}));
