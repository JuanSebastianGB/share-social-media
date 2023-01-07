import { Box, Typography } from '@mui/material';
import { FC } from 'react';

interface Props {
  title: string;
}

const Header: FC<Props> = ({ title }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 70,
        backgroundColor: 'primary.light',
        color: 'primary.contrastText',
      }}
    >
      <Typography>{title.toUpperCase()}</Typography>
    </Box>
  );
};

export default Header;
