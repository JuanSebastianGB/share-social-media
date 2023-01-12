import * as yup from 'yup';

export const postSchema = yup
  .object({
    body: yup.string().required().min(10).max(50),
    userId: yup.string().required(),
  })
  .required();
