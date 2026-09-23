import AddToPhotosRoundedIcon from '@mui/icons-material/AddToPhotosRounded';
import { Box, Typography, useTheme, type SxProps, type Theme } from '@mui/material';
import type { FormikHelpers } from 'formik';
import { FC, useCallback, useEffect, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { SpaceBetweenColumn } from '../Navbar';
import { Thumbs } from '@/features/feed/ui';
import { customFile } from '@/features/feed/ui/AddPost/DropzoneAddPost/Thumbs/Thumbs';

export interface Props {
  /**
   * Formik-compatible field setter. Mirrors `FormikHelpers<V>['setFieldValue']`
   * so any concrete form's setter is accepted without a cast at the call site.
   */
  setFieldValue: FormikHelpers<unknown>['setFieldValue'];
  sx?: SxProps<Theme>;
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
          }),
        ),
      );
      setFieldValue(fileName, acceptedFiles[0]);
    },
    [fileName, setFieldValue],
  );

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop,
    multiple: false,
  });
  const fileRejectionItems = fileRejections.map(
    ({ file, errors }: FileRejection) => (
      <li key={file.path}>
        {file.path} - {file.size} bytes
        <ul>
          {errors.map((e) => (
            <li key={e.code}>{e.message}</li>
          ))}
        </ul>
      </li>
    ),
  );

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

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