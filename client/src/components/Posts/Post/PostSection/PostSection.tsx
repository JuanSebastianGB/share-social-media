import { UserApiModel } from '@/models';
import { SpaceBetween } from '@/styled-components';
import { PersonAdd, PersonRemove } from '@mui/icons-material';
import { Avatar, Box, IconButton, Typography, useTheme } from '@mui/material';
import React, { Fragment } from 'react';
export interface Props {
  userPost: UserApiModel;
  isOwn: boolean;
  isFriend: boolean;
  handleClick: any;
}

const PostSection: React.FC<Props> = ({
  userPost,
  isOwn,
  isFriend,
  handleClick,
}) => {
  const theme = useTheme();
  return (
    <Fragment>
      <SpaceBetween>
        <SpaceBetween
          gap="1rem"
          sx={{
            flex: 1,
            justifyContent: 'flex-start',
          }}
        >
          <Avatar src={userPost?.profileImage.url} />
          <Box>
            <Typography variant="subtitle1" color={theme.palette.neutral.dark}>
              Title
            </Typography>
            <Typography
              color={theme.palette.neutral.mediumMain}
              sx={{ fontSize: '12px' }}
            >
              {userPost?.occupation}
            </Typography>
          </Box>
        </SpaceBetween>
        {!isOwn && (
          <Fragment>
            {isFriend ? (
              <IconButton
                aria-label="remove-friend"
                color="warning"
                onClick={handleClick}
              >
                <PersonRemove sx={{ fontSize: '18px' }} />
              </IconButton>
            ) : (
              <IconButton
                aria-label="add-friend"
                color="warning"
                onClick={handleClick}
              >
                <PersonAdd sx={{ fontSize: '18px' }} />
              </IconButton>
            )}
          </Fragment>
        )}
      </SpaceBetween>
      <Typography variant="body2" sx={{ color: theme.palette.neutral.dark }}>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem repellat
        esse reiciendis odit adipisci velit iste soluta, earum quam praesentium
        veniam nesciunt
      </Typography>
    </Fragment>
  );
};

export default PostSection;
