import { Box, Typography, useTheme } from '@mui/material';
import { FC } from 'react';

interface Props {
  title: string;
  subtitle: string;
}

const TitleAndSubtitle: FC<Props> = ({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <Box sx={{ my: '10px' }}>
      <Typography variant="body1" color={theme.palette.neutral.dark}>
        {title}
      </Typography>
      <Typography
        sx={{ transform: 'translate(10px,20px) scale 1' }}
        variant="caption"
        fontSize="0.5rem"
        color={theme.palette.neutral.dark}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default TitleAndSubtitle;
