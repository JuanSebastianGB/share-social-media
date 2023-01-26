import { AppStore, PostApiModel } from '@/models';
import { updatePost } from '@/redux/states/authSlice';
import { fetchPostComments, postComment } from '@/services';
import { formatDate } from '@/utilities';
import ImageIcon from '@mui/icons-material/Image';
import {
  Avatar,
  Box,
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

interface Props {
  open: boolean;
  onClose: (value: string) => void;
  post: PostApiModel;
}

const CommentsModal: FC<Props> = ({ open, onClose, post }) => {
  const dispatch = useDispatch();
  const { id } = useSelector((storage: AppStore) => storage.auth.user);
  const theme = useTheme();
  const handleClose = () => {
    onClose('close');
  };
  const [comments, setComments] = useState([]);
  const [description, setDescription] = useState<string>('');
  const [posted, setPosted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = {
      userId: id,
      postId: post._id,
      firstName: post.user.firstName,
      lastName: post.user.lastName,
      description,
    };
    postComment(body)
      .then((response) => {
        dispatch(updatePost(response));
        setPosted((prev) => !prev);
      })
      .catch(console.log);
  };

  useEffect(() => {
    fetchPostComments(post._id).then((data) => setComments(data));
  }, [posted]);

  return (
    <Dialog fullWidth maxWidth="md" onClose={handleClose} open={open}>
      <DialogTitle>Comments</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '90%',
          margin: '0 auto 2rem',
          display: 'flex',
        }}
      >
        <TextField
          label="Post..."
          value={description}
          variant="outlined"
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          sx={{ flex: 1 }}
        />
        <TextField id="" type="submit" variant="outlined" value="send" />
      </Box>
      {!!comments.length &&
        comments.map(({ firstName, lastName, description, createdAt }) => (
          <List key={createdAt} sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <ImageIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                secondary={`${firstName} ${lastName}`}
                primary={description}
              />
            </ListItem>
            <Typography
              sx={{ padding: '2rem', whiteSpace: 'nowrap' }}
              variant="caption"
              color={theme.palette.neutral.dark}
            >
              {formatDate(createdAt)}
            </Typography>
          </List>
        ))}
    </Dialog>
  );
};

export default CommentsModal;
