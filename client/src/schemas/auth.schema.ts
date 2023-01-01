import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string().required().email('Invalid email'),
  password: yup
    .string()
    .required('Password required')
    .min(3, 'Too short')
    .max(20, 'Too large'),
});
export const registerSchema = yup.object().shape({
  email: yup.string().required().email('Invalid email'),
  password: yup
    .string()
    .required('Password required')
    .min(3, 'Too short')
    .max(20, 'Too large'),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  location: yup.string().required(),
  occupation: yup.string().required(),
  picture: yup.string().required(),
});
