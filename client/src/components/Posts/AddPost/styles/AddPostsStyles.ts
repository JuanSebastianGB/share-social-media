import { Box, styled } from '@mui/material';

export const AddPostsStyles = styled(Box)(({ theme }) => ({
  form: {
    '& img': {
      width: '100%',
    },
    '& .control': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'column',
      padding: '0.5rem',
      gap: '0.5rem',
      width: '90%',
      margin: 'auto',
    },
    [theme.breakpoints.up('md')]: {
      '& .control': {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        padding: '0.5rem',
        gap: '0.5rem',
        width: '100%',
        margin: 'auto',
      },
    },
  },
}));
