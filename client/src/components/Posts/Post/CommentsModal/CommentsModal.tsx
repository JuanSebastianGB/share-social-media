import { fetchPostComments } from '@/services';
import { Dialog, DialogTitle } from '@mui/material';
import { FC, useEffect, useState } from 'react';

interface Props {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
  post: any;
}

const CommentsModal: FC<Props> = ({ open, selectedValue, onClose, post }) => {
  const handleClose = () => {
    onClose(selectedValue);
  };
  const [comments, setComments] = useState({});

  console.log({ comments });

  useEffect(() => {
    fetchPostComments(post._id).then((data) => setComments(data));
  }, []);

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Set backup account</DialogTitle>
      {JSON.stringify(post)}
      {/* {!!comments && comments.map((comment) => <>Comment</>)} */}
    </Dialog>
  );
};

export default CommentsModal;
