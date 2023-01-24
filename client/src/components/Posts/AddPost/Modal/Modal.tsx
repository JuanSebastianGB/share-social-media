import { useUser } from '@/hooks';
import { AppStore } from '@/models';
import { createPost } from '@/redux/states/authSlice';
import { makePostFileService, makePostService } from '@/services';
import {
  Avatar,
  Box,
  Button,
  DialogContent,
  InputBase,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { DropzoneAddPost } from '../DropzoneAddPost';
import { BootstrapDialogTitle } from './BootstrapDialogTitle';
import { BootstrapDialog } from './styles';

interface ModalProps {
  open: boolean;
  handleClose: () => void;
  addAction: string;
}

const validationSchema = yup.object().shape({
  body: yup.string().required(),
});

const initialValues = { body: '', myFile: File };

const StyledForm = styled('form')(({ theme }) => ({
  padding: '2rem',
}));

export const Modal: FC<ModalProps> = ({ open, handleClose, addAction }) => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const { user } = useUser(id);
  const theme = useTheme();
  const [showButton, setShowButton] = useState(true);
  const dispatch = useDispatch();

  const onSubmit = async ({ body, myFile }: any, { resetForm }: any) => {
    setShowButton(false);
    const form = new FormData();
    form.append('body', body);
    form.append('userId', id);
    if (addAction === 'file/video') form.append('myFile', myFile);
    try {
      let newPost;
      if (addAction === 'file/video') newPost = await makePostFileService(form);
      if (addAction === 'comment') newPost = await makePostService(form);
      setShowButton(true);
      dispatch(createPost(newPost));
      handleClose();
      resetForm();
    } catch (error) {
      setShowButton(true);
    }
  };

  const { getFieldProps, setFieldValue, handleSubmit } = useFormik({
    onSubmit,
    initialValues,
    validationSchema,
  });

  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
        maxWidth="md"
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          Create Post
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <StyledForm onSubmit={handleSubmit}>
            <Box sx={{ padding: '2rem' }}>
              <Box
                gap="0.8rem"
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                }}
              >
                <Avatar src={user?.picturePath} />
                <Typography
                  variant="subtitle1"
                  align="center"
                  width="100%"
                  color="GrayText"
                >
                  {user?.firstName} {user?.lastName}
                </Typography>
              </Box>
              <InputBase
                {...getFieldProps('body')}
                sx={{
                  background: theme.palette.background.paper,
                  borderRadius: '10px',
                  p: '10px',
                  mb: '10px',
                  width: '100%',
                  justifyContent: 'center',
                }}
                placeholder={`what is in your mind  ${user?.firstName}`}
              />
            </Box>
            {addAction === 'file/video' && (
              <DropzoneAddPost setFieldValue={setFieldValue} />
            )}

            {showButton && (
              <Button variant="text" type="submit" color="primary" fullWidth>
                Publish
              </Button>
            )}
          </StyledForm>
        </DialogContent>
      </BootstrapDialog>
    </Box>
  );
};
