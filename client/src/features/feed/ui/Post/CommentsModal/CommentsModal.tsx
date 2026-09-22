import { usePostComments } from '../../../hooks';
import { PostApiModel } from '@/models';
import { formatDate } from '@/shared/lib/utilities';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { FC } from 'react';

interface Props {
  open: boolean;
  onClose: (value: string) => void;
  post: PostApiModel;
  isOwn: boolean;
}

const CommentsModal: FC<Props> = ({ open, onClose, post }) => {
  const theme = useTheme();
  const {
    comments,
    description,
    setDescription,
    loadingList,
    listError,
    submitting,
    submitError,
    handleSubmit,
    retryLoad,
  } = usePostComments(post, open);

  const handleClose = () => {
    if (submitting) return;
    onClose('close');
  };

  return (
    <Dialog fullWidth maxWidth="md" onClose={handleClose} open={open}>
      <DialogTitle>Comments</DialogTitle>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '90%',
          margin: '0 auto 1rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}
      >
        <TextField
          label="Write a comment"
          value={description}
          variant="outlined"
          onChange={(e) => setDescription(e.target.value)}
          sx={{ flex: 1 }}
          disabled={submitting}
          inputProps={{ 'aria-label': 'Write a comment' }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={submitting || !description.trim()}
          sx={{ minWidth: '6.5rem', mt: '0.5rem' }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Send'}
        </Button>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ width: '90%', mx: 'auto', mb: '1rem' }}>
          {submitError}
        </Alert>
      )}

      {listError && (
        <Alert
          severity="error"
          sx={{ width: '90%', mx: 'auto', mb: '1rem' }}
          action={
            <Button color="inherit" size="small" onClick={retryLoad}>
              Retry
            </Button>
          }
        >
          {listError}
        </Alert>
      )}

      {loadingList && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: '2rem' }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loadingList && !listError && comments.length === 0 && (
        <Typography
          variant="body2"
          color={theme.palette.neutral.dark}
          align="center"
          sx={{ py: '2rem' }}
        >
          No comments yet. Be the first to reply.
        </Typography>
      )}

      {!loadingList &&
        comments.map(({ firstName, lastName, description: text, createdAt }) => {
          const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
          return (
            <List
              key={`${createdAt}-${firstName}-${lastName}-${text}`}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ListItem>
                <ListItemAvatar>
                  <Avatar alt={`${firstName} ${lastName}`}>{initials}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  secondary={`${firstName} ${lastName}`}
                  primary={text}
                />
              </ListItem>
              <Typography
                sx={{ px: '1rem', whiteSpace: 'nowrap' }}
                variant="caption"
                color={theme.palette.neutral.dark}
              >
                {formatDate(createdAt)}
              </Typography>
            </List>
          );
        })}
    </Dialog>
  );
};

export default CommentsModal;
