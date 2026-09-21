import CloseIcon from '@mui/icons-material/Close';
import { DialogTitle, IconButton } from '@mui/material';
import { FC, ReactNode } from 'react';
export interface Props {
  id: string;
  children?: ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
}

const BootstrapDialogTitle: FC<Props> = (props) => {
  const { children, onClose, closeDisabled = false, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="Close"
          onClick={onClose}
          disabled={closeDisabled}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.neutral.mediumMain,
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default BootstrapDialogTitle;
