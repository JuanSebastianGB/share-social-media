import { AvatarWithTitles } from '@/components/AvatarWithTitles';
import { UserApiModel } from '@/models';
import { SpaceBetween } from '@/styled-components';
import { PersonAdd, PersonRemove } from '@mui/icons-material';
import { IconButton, Typography, useTheme } from '@mui/material';
import React, { Fragment } from 'react';
export interface Props {
  userPost: UserApiModel;
  isOwn: boolean;
  isFriend: boolean;
  handleClick: any;
  body: string;
}

const PostSection: React.FC<Props> = ({
  userPost,
  isOwn,
  isFriend,
  handleClick,
  body,
}) => {
  const theme = useTheme();

  return (
    <Fragment>
      <SpaceBetween>
        <AvatarWithTitles
          profileImage={userPost?.profileImage.url}
          title={`${userPost.firstName} ${userPost.lastName}`}
          subTitle={userPost.occupation}
          userId={userPost._id}
        />
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
        {body}
      </Typography>
    </Fragment>
  );
};

export default PostSection;
