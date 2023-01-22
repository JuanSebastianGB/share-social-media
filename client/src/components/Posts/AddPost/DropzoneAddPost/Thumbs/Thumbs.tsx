import { Box } from '@mui/material';
import { FC } from 'react';

export interface customFile extends File {
  preview: string;
}
export interface Props {
  files: customFile[];
}

const Thumbs: FC<Props> = ({ files }) => {
  return (
    <>
      {files
        ? files.map((file) => (
            <Box
              sx={{
                display: 'flex',
                borderRadius: 2,
                border: '1px solid #eaeaea',
                marginBottom: 8,
                marginRight: 8,
                width: '100%',
                height: 'auto',
                padding: 4,
              }}
              key={file.name}
            >
              <Box
                sx={{
                  display: 'flex',
                  minWidth: 0,
                  width: '100%',
                  overflow: 'hidden',
                  objectFit: 'cover',
                }}
              >
                <Box
                  component="img"
                  sx={{
                    objectFit: 'cover',
                    width: '100%',
                    borderRadius: '15px',
                  }}
                  src={file.preview}
                  onLoad={() => {
                    // URL.revokeObjectURL(file.preview);
                  }}
                />
              </Box>
            </Box>
          ))
        : null}
    </>
  );
};

export default Thumbs;
