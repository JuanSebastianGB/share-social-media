import AddToPhotosRoundedIcon from '@mui/icons-material/AddToPhotosRounded';
import { Box, Typography, useTheme } from '@mui/material';
import { FC, useCallback, useEffect, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { SpaceBetweenColumn } from '../Navbar';
import { Thumbs } from '../Posts';
import { customFile } from '../Posts/AddPost/DropzoneAddPost/Thumbs/Thumbs';
export interface Props {
  setFieldValue: any;
  sx?: any;
}

interface CustomFile extends FileWithPath {
  preview?: string;
}

// const Dropzone: React.FC<Props> = ({ setFieldValue, sx }) => {
//   const [files, setFiles] = useState([]);

//   const onDrop = useCallback(
//     (acceptedFiles: CustomFile[]) => {
//       setFiles(
//         // @ts-ignore
//         acceptedFiles.map((file: CustomFile) => ({
//           ...file,
//           preview: URL.createObjectURL(file),
//         }))
//       );
//       setFieldValue(FILE_NAME, acceptedFiles[0]);
//     },
//     [setFiles]
//   );

//   const { getInputProps, getRootProps, isDragActive } = useDropzone({
//     accept: {
//       'image/*': ['.jpeg', '.jpg', '.png'],
//     },
//     onDrop,
//   });
//   return (
//     <Box sx={sx}>
//       <Box
//         {...getRootProps()}
//         sx={{
//           width: '100%',
//           cursor: 'pointer',
//         }}
//       >
//         <input {...getInputProps()} />
//         {!isDragActive ? <>Insert picture Here !</> : <>picture selected</>}
//       </Box>
//       {!!files.length && <Thumb src={files[0]['preview']} />}
//     </Box>
//   );
// };

const Dropzone: FC<Props> = ({ setFieldValue }) => {
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
            border: 'thin solid #ced0d4',
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
              Add Photo
            </Typography>
            <Typography
              variant="caption"
              color={theme.palette.neutral.main}
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
