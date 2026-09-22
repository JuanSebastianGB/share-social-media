import { useUser } from '@/hooks';
import { useCreatePost } from '../../../hooks';
import { AppStore } from '@/models';
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
import { FC } from 'react';
import { useSelector } from 'react-redux';
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
  const { loading, submitError, onSubmit } = useCreatePost(
    addAction,
    handleClose
  );

  const requestClose = () => {
    if (loading) return;
    handleClose();
  };

  const { getFieldProps, setFieldValue, handleSubmit, touched, errors } =
    useFormik({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches legacy Formik submit shape
      onSubmit: onSubmit as any,
      initialValues,
      validationSchema,
    });

  return (
    <Box>
      <BootstrapDialog
        onClose={requestClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
        maxWidth="md"
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={requestClose}
          closeDisabled={loading}
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
