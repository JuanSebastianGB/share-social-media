import { SpaceBetweenColumn } from '@/styled-components';
import AddToPhotosRoundedIcon from '@mui/icons-material/AddToPhotosRounded';
import { Box, Typography, useTheme } from '@mui/material';
import { FC, useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Thumbs } from './Thumbs';

function nameLengthValidator(file: File) {
  const maxLength = 150;
  if (file.name.length > maxLength)
    return {
      code: 'name-too-large',
      message: `Name is larger than ${maxLength} characters`,
    };
  return null;
}

interface customFile extends File {
  preview: string;
}

interface Props {
  setFieldValue: (fileName: string, fileAccepted: File) => void;
}

const DropzoneAddPost: FC<Props> = ({ setFieldValue }) => {
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
      setFieldValue('myFile', acceptedFiles[0]);
    },
    [setFiles]
  );

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    validator: nameLengthValidator,
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
    <Box className="container">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <Box
          sx={{
            padding: '0.5rem',
            cursor: 'pointer',
            background: theme.palette.background.paper,
            border: `thin solid #ced0d4`,
            borderRadius: '10px',
          }}
        >
          <SpaceBetweenColumn sx={{ height: '100%', justifyContent: 'center' }}>
            <AddToPhotosRoundedIcon />
            <Typography
              variant="subtitle1"
              color={theme.palette.neutral.main}
              align="center"
            >
              Add Photos
            </Typography>
            <Typography
              variant="caption"
              color={theme.palette.neutral.main}
              align="center"
            >
              Or Drag them
            </Typography>
          </SpaceBetweenColumn>
        </Box>
      </div>
      {fileRejectionItems}
      <Box>{!!files && <Thumbs files={files} />}</Box>
    </Box>
  );
};

export default DropzoneAddPost;
