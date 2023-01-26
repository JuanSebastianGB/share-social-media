import { Avatar, Box, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { SpaceBetween } from '../Navbar';
export interface Props {
  profileImage: string;
  title: string;
  subTitle: string;
  userId: string;
}

const AvatarWithTitles: React.FC<Props> = ({
  profileImage,
  title,
  subTitle,
  userId,
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
          <Box
            sx={{
              textDecoration: 'none',
              fontSize: '13px',
              color: theme.palette.neutral.dark,
            }}
            component={Link}
            to={`/profile/${userId}`}
            replace={true}
          >
            {title}
          </Box>
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
