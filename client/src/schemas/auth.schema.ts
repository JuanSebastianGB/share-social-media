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
    .min(5, 'Too short')
    .max(30, 'Too large'),
  firstName: yup.string().required().min(5).max(30),
  lastName: yup.string().required().min(5).max(30),
  location: yup.string().required(),
  occupation: yup.string().required(),
  myFile: yup.string().required(),
});
