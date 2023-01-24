import { UserApiModel } from '@/models';
import { SpaceBetween, SpaceBetweenColumn } from '@/styled-components';
import { AttachFile } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  InputBase,
  Typography,
  useTheme,
} from '@mui/material';
import React, { Fragment, useState } from 'react';
import { Modal } from './Modal';
import { AddPostsStyles } from './styles';
export interface Props {
  user: UserApiModel;
}

const AddPost: React.FC<Props> = ({ user }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState<boolean>(false);
  const [addAction, setAddAction] = useState('file');

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Modal addAction={addAction} open={open} handleClose={handleClose} />
      <AddPostsStyles>
        <SpaceBetweenColumn gap="0.2rem">
          <SpaceBetween
            gap="2rem"
            sx={{
              padding: '1rem',
              width: '90%',
              margin: '1rem auto 0',
            }}
          >
            <Avatar src={user?.picturePath} />
            <InputBase
              sx={{
                background: theme.palette.background.default,
                borderRadius: '10px',
                pl: '10px',
                mb: '10px',
                width: '100%',
                cursor: 'pointer',
                '& .MuiInputBase-input': {
                  cursor: 'pointer',
                },
              }}
              onClick={() => {
                setOpen(true);
                setAddAction('comment');
              }}
              placeholder={`What is in your mind ${user?.firstName} `}
            />
          </SpaceBetween>
          <Divider sx={{ width: '100%' }} />
          <Box
            sx={{
              margin: '0 auto 1rem',
              padding: '1rem',
              width: '90%',
            }}
          >
            <Box sx={{ borderRadius: '10px' }}>
              <SpaceBetween
                width="4.5rem"
                onClick={() => {
                  setOpen(true);
                  setAddAction('file/video');
                }}
              >
                <IconButton>
                  <AttachFile fontSize="small" />
                  <Typography variant="subtitle2" color="GrayText">
                    Photo/video
                  </Typography>
                </IconButton>
              </SpaceBetween>
            </Box>
          </Box>
        </SpaceBetweenColumn>
      </AddPostsStyles>
    </Fragment>
  );
};

export default AddPost;
