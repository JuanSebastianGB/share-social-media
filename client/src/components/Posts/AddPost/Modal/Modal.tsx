import { useUser } from '@/hooks';
import { AppStore } from '@/models';
import { useHomeContext } from '@/pages/Home/context';
import { makePostService } from '@/services';
import {
  Avatar,
  Box,
  Button,
  DialogContent,
  InputBase,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import * as yup from 'yup';
import { DropzoneAddPost } from '../DropzoneAddPost';
import { BootstrapDialogTitle } from './BootstrapDialogTitle';
import { BootstrapDialog } from './styles';

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

const validationSchema = yup.object().shape({
  body: yup.string().required(),
});

const initialValues = { body: '', myFile: File };

export const Modal: FC<ModalProps> = ({ open, handleClose }) => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  const { data: user } = useUser();
  const theme = useTheme();
  const {
    postsState: { mutatePosts },
  } = useHomeContext();
  const [showButton, setShowButton] = useState(true);

  const onSubmit = async ({ body, myFile }: any, { resetForm }: any) => {
    setShowButton(false);
    const form = new FormData();
    form.append('body', body);
    form.append('userId', id);
    form.append('myFile', myFile);
    try {
      await makePostService(form);
      setShowButton(true);
      mutatePosts();
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
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          Create Post
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit}>
            <Box>
              <Box
                gap="0.8rem"
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                }}
              >
                <Avatar src={user?.picturePath} />
                <Typography variant="subtitle1" color="GrayText">
                  {user?.firstName} {user?.lastName}
                </Typography>
              </Box>
              <InputBase
                {...getFieldProps('body')}
                sx={{
                  background: theme.palette.background.paper,
                  borderRadius: '15px',
                  p: '10px',
                  mb: '10px',
                  width: '100%',
                }}
                placeholder={`what is in your mind  ${user?.firstName}`}
              />
            </Box>
            <DropzoneAddPost setFieldValue={setFieldValue} />
            {showButton && (
              <Button variant="text" type="submit" color="primary" fullWidth>
                Publish
              </Button>
            )}
          </form>
        </DialogContent>
      </BootstrapDialog>
    </Box>
  );
};
