import { AppStore, PostApiModel } from '@/models';
import { updatePost } from '@/redux/states/postsSlice';
import { fetchPostComments, postComment } from '@/services';
import { formatDate } from '@/utilities';
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
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface CommentRow {
  firstName: string;
  lastName: string;
  description: string;
  createdAt: string;
  userPicturePath?: string;
}

interface Props {
  open: boolean;
  onClose: (value: string) => void;
  post: PostApiModel;
  isOwn: boolean;
}

const CommentsModal: FC<Props> = ({ open, onClose, post }) => {
  const dispatch = useDispatch();
  const authUser = useSelector((storage: AppStore) => storage.auth.user);
  const { id } = authUser;
  const theme = useTheme();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [description, setDescription] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleClose = () => {
    if (submitting) return;
    onClose('close');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    const nameParts = (authUser.name || '').trim().split(/\s+/);
    const body = {
      userId: id,
      postId: post._id,
      firstName: nameParts[0] || 'User',
      lastName: nameParts.slice(1).join(' '),
      description: trimmed,
    };

    try {
      const response = await postComment(body);
      dispatch(updatePost(response));
      setDescription('');
      setReloadKey((prev) => prev + 1);
    } catch {
      setSubmitError("Couldn't post your comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingList(true);
    setListError(null);
    fetchPostComments(post._id)
      .then((data) => {
        if (!cancelled) setComments(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setListError("Couldn't load comments. Please try again.");
          setComments([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, post._id, reloadKey]);

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
            <Button
              color="inherit"
              size="small"
              onClick={() => setReloadKey((prev) => prev + 1)}
            >
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
