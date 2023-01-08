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
        backgroundColor: 'background.paper',
        color: 'primary.dark',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {title.toUpperCase()}
      </Typography>
    </Box>
  );
};

export default Header;
