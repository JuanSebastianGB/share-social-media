import { Box, Typography, useTheme } from '@mui/material';
import { FC } from 'react';
import { TitleAndSubtitle } from '../TitleAndSubtitle';
interface Props {}

const Trends: FC<Props> = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: {
          sm: '200px',
          md: '100%',
        },
        padding: '1rem',
        borderRadius: '10px',
        background: theme.palette.background.paper,
        pb: '1rem',
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        color={theme.palette.primary.main}
      >
        Trends
      </Typography>
      <TitleAndSubtitle title="ReactJs" subtitle="100k shares" />
      <TitleAndSubtitle title="House of dragon" subtitle="30k shares" />
      <TitleAndSubtitle title="Crypto" subtitle="50k shares" />
      <TitleAndSubtitle title="Dev" subtitle="50k shares" />
    </Box>
  );
};

export default Trends;
