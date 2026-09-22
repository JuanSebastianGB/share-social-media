import { Box } from '@mui/material';
import React from 'react';
export interface Props {
  src: string;
}

const Thumb: React.FC<Props> = ({ src }) => {
  return (
    <Box
      component="img"
      src={src}
      sx={{ height: 200, width: 200, objectFit: 'cover' }}
    />
  );
};

export default Thumb;
