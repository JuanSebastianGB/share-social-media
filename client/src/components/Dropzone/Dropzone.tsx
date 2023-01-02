import { FILE_NAME } from '@/models';
import { Box } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { Thumb } from '../Thumb';
export interface Props {
  setFieldValue: any;
}

interface CustomFile extends FileWithPath {
  preview?: string;
}

const Dropzone: React.FC<Props> = ({ setFieldValue }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles: CustomFile[]) => {
      setFiles(
        acceptedFiles.map((file: CustomFile) => ({
          ...file,
          preview: URL.createObjectURL(file),
        }))
      );
      setFieldValue(FILE_NAME, acceptedFiles[0]);
    },
    [setFiles]
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    onDrop,
  });
  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          width: '100%',
          cursor: 'pointer',
        }}
      >
        <input {...getInputProps()} />
        {!isDragActive ? <>Insert picture Here !</> : <>picture selected</>}
      </Box>
      {!!files.length && <Thumb src={files[0]['preview']} />}
    </>
  );
};

export default Dropzone;
