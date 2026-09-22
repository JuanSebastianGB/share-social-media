import { AvatarWithTitles } from '@/shared/ui/AvatarWithTitles';
import { UserApiModel } from '@/models';
import { SpaceBetween } from '@/shared/ui/styled-components';
import { PersonAdd, PersonRemove } from '@mui/icons-material';
import { IconButton, Typography, useTheme } from '@mui/material';
import React, { Fragment } from 'react';
export interface Props {
  userPost: UserApiModel;
  isOwn: boolean;
  isFriend: boolean;
  handleClick: () => void;
  body: string;
  disabled?: boolean;
}

const PostSection: React.FC<Props> = ({
  userPost,
  isOwn,
  isFriend,
  handleClick,
  body,
  disabled = false,
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
                disabled={disabled}
              >
                <PersonRemove fontSize="small" />
              </IconButton>
            ) : (
              <IconButton
                aria-label="add-friend"
                color="warning"
                onClick={handleClick}
                disabled={disabled}
              >
                <PersonAdd fontSize="small" />
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
