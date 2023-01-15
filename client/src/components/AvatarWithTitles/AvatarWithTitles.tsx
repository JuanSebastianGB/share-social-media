import { Avatar, Box, Typography, useTheme } from '@mui/material';
import React from 'react';
import { SpaceBetween } from '../Navbar';
export interface Props {
  profileImage: string;
  title: string;
  subTitle: string;
}

const AvatarWithTitles: React.FC<Props> = ({
  profileImage,
  title,
  subTitle,
}) => {
  const theme = useTheme();
  return (
    <SpaceBetween
      gap="1rem"
      sx={{
        flex: 1,
        justifyContent: 'flex-start',
      }}
    >
      <Avatar src={profileImage} />
      <Box>
        <Typography variant="subtitle1" color={theme.palette.neutral.dark}>
          {title}
        </Typography>
        <Typography
          color={theme.palette.neutral.mediumMain}
          sx={{ fontSize: '12px' }}
        >
          {subTitle}
        </Typography>
      </Box>
    </SpaceBetween>
  );
};

export default AvatarWithTitles;
