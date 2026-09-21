import { useUser } from '@/hooks';
import { AppStore } from '@/models';
import { createPost } from '@/redux/states/postsSlice';
import { makePostFileService, makePostService } from '@/services';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
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
  body: yup.string().required('Post body is required'),
});

const initialValues = { body: '', myFile: File };

const StyledForm = styled('form')(({ theme }) => ({
  padding: '2rem',
}));

export const Modal: FC<ModalProps> = ({ open, handleClose, addAction }) => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const { user } = useUser(id);
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const onSubmit = async ({ body, myFile }: any, { resetForm }: any) => {
    setLoading(true);
    setSubmitError(null);
    const form = new FormData();
    form.append('body', body);
    form.append('userId', id);
    if (addAction === 'file/video') form.append('myFile', myFile);
    try {
      let newPost;
      if (addAction === 'file/video') {
        form.append('type', 'file/video');
        newPost = await makePostFileService(form);
      }
      if (addAction === 'comment') {
        form.append('type', 'comment');
        newPost = await makePostService(form);
      }
      dispatch(createPost(newPost));
      handleClose();
      resetForm();
    } catch {
      setSubmitError("Couldn't publish your post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const {
    getFieldProps,
    setFieldValue,
    handleSubmit,
    touched,
    errors,
  } = useFormik({
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
                placeholder={`What's on your mind, ${user?.firstName}?`}
              />
              {touched.body && errors.body && (
                <Typography variant="caption" color="error" display="block" mb={1}>
                  {errors.body}
                </Typography>
              )}
              {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submitError}
                </Alert>
              )}
            </Box>
            {addAction === 'file/video' && (
              <DropzoneAddPost setFieldValue={setFieldValue} />
            )}

            <Button
              variant="contained"
              type="submit"
              color="primary"
              fullWidth
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              {loading ? 'Publishing…' : 'Publish'}
            </Button>
          </StyledForm>
        </DialogContent>
      </BootstrapDialog>
    </Box>
  );
};
