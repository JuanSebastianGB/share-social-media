import { PostApiModel } from '@/models';
import { fetchPostComments } from '@/services';
import { formatDate } from '@/utilities';
import ImageIcon from '@mui/icons-material/Image';
import {
  Avatar,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import { FC, useEffect, useState } from 'react';

interface Props {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
  post: PostApiModel;
}

const CommentsModal: FC<Props> = ({ open, onClose, post }) => {
  const theme = useTheme();
  const handleClose = () => {
    onClose('close');
  };
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchPostComments(post._id).then((data) => setComments(data));
  }, []);

  return (
    <Dialog fullWidth maxWidth="md" onClose={handleClose} open={open}>
      <DialogTitle>Comments</DialogTitle>
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
