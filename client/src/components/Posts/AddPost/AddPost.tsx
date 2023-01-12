import { AppStore, PostFormInterface } from '@/models';
import { useHomeContext } from '@/pages/Home/context';
import { postSchema } from '@/schemas';
import { makePostService } from '@/services';
import { yupResolver } from '@hookform/resolvers/yup';
import AttachmentIcon from '@mui/icons-material/Attachment';
import { Box, Button, Fab, TextareaAutosize, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { AddPostsStyles } from './styles';
export interface Props {}

const AddPost: React.FC<Props> = () => {
  const { id } = useSelector((store: AppStore) => store.auth.user);
  // const [selectedImage, setSelectedImage] = useState(null);
  // const [imageUrl, setImageUrl] = useState('');
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const {
    postsState: { mutatePosts },
  } = useHomeContext();

  const formInitialValues: PostFormInterface = {
    userId: id,
    body: '',
    myFile: {} as any,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PostFormInterface>({
    resolver: yupResolver(postSchema),
    defaultValues: formInitialValues,
  });
  const onSubmit = async (data: PostFormInterface) => {
    console.log({ data });
    const form = new FormData();
    form.append('body', data.body);
    form.append('myFile', data?.myFile[0]);
    form.append('userId', data.userId);
    try {
      setShowSubmitButton(false);
      const response = await makePostService(form);
      mutatePosts();
      reset();
      // setImageUrl('');
      // setSelectedImage(null);
      setShowSubmitButton(true);
    } catch (error) {
      setShowSubmitButton(true);
      console.log({ error });
    }
  };

  // useEffect(() => {
  //   if (selectedImage) {
  //     setImageUrl(URL.createObjectURL(selectedImage));
  //   }
  // }, [selectedImage]);

  return (
    <AddPostsStyles>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextareaAutosize
          placeholder="Post content..."
          minRows={4}
          style={{ width: '100%' }}
          {...register('body')}
        />
        <TextField type="hidden" {...register('userId')} />
        {errors?.body && <>{errors?.body?.message}</>}
        <input
          id="myFile"
          {...register('myFile')}
          type="file"
          style={{ display: 'none' }}
          accept="image/*"
          required
          // onChange={(e) => {
          //   setSelectedImage(e?.target?.files?.[0]);
          // }}
        />

        <Box className="control">
          <label htmlFor="myFile">
            <Fab
              color="inherit"
              variant="circular"
              size="small"
              component="span"
              aria-label="add"
            >
              <AttachmentIcon />
            </Fab>
          </label>
          {showSubmitButton && (
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              fullWidth
            >
              SAVE POST
            </Button>
          )}
        </Box>
        {/* {!!imageUrl && selectedImage && <img src={imageUrl} alt="image" />} */}
      </form>
    </AddPostsStyles>
  );
};

export default AddPost;
