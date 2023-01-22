import AddToPhotosRoundedIcon from '@mui/icons-material/AddToPhotosRounded';
import { Box, Typography, useTheme } from '@mui/material';
import { FC, useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { SpaceBetweenColumn } from '../Navbar';
import { Thumbs } from '../Posts';
import { customFile } from '../Posts/AddPost/DropzoneAddPost/Thumbs/Thumbs';
export interface Props {
  setFieldValue: any;
  sx?: any;
  fileName: string;
  isError: boolean;
}
const Dropzone: FC<Props> = ({ setFieldValue, fileName, isError }) => {
  const [files, setFiles] = useState<customFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
      setFieldValue(fileName, acceptedFiles[0]);
    },
    [setFiles]
  );

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop,
    multiple: false,
  });
  const fileRejectionItems = fileRejections.map(({ file, errors }: any) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      <ul>
        {errors.map((e: any) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  const theme = useTheme();

  return (
    <Box position="relative" className="container">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <Box
          sx={{
            padding: '0.5rem',
            cursor: 'pointer',
            background: theme.palette.background.paper,
            border: `thin solid ${isError ? '#d32f2f' : '#ced0d4'} `,
            borderRadius: '10px',
          }}
        >
          <SpaceBetweenColumn sx={{ height: '100%', justifyContent: 'center' }}>
            <AddToPhotosRoundedIcon />
            <Typography
              variant="subtitle1"
              color={isError ? '#d32f2f' : theme.palette.neutral.main}
              align="center"
            >
              Add profile Photo
            </Typography>
            <Typography
              variant="caption"
              color={isError ? '#d32f2f' : theme.palette.neutral.main}
              align="center"
            >
              Or Drag
            </Typography>
          </SpaceBetweenColumn>
        </Box>
      </div>
      {fileRejectionItems}
      <Box>{!!files && <Thumbs files={files} />}</Box>
    </Box>
  );
};

export default Dropzone;
