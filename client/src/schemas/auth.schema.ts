import { isCognitoClientEnabled } from '@/shared/lib/utilities/cognitoMode';
import * as yup from 'yup';

/** Cognito pool policy: min 8, upper + lower + digit (no symbol required). */
const cognitoPasswordSchema = yup
  .string()
  .required('Password required')
  .min(8, 'At least 8 characters')
  .max(256, 'Too large')
  .matches(/[a-z]/, 'Need a lowercase letter')
  .matches(/[A-Z]/, 'Need an uppercase letter')
  .matches(/[0-9]/, 'Need a number');

/** Local HS256 demo — matches historical client + server validators. */
const localPasswordSchema = yup
  .string()
  .required('Password required')
  .min(5, 'Too short')
  .max(30, 'Too large');

const localLoginPasswordSchema = yup
  .string()
  .required('Password required')
  .min(3, 'Too short')
  .max(20, 'Too large');

const passwordForRegister = () =>
  isCognitoClientEnabled() ? cognitoPasswordSchema : localPasswordSchema;

const passwordForLogin = () =>
  isCognitoClientEnabled() ? cognitoPasswordSchema : localLoginPasswordSchema;

export const loginSchema = yup.object().shape({
  email: yup.string().required().email('Invalid email'),
  password: passwordForLogin(),
});

export const registerSchema = yup.object().shape({
  email: yup.string().required().email('Invalid email'),
  password: passwordForRegister(),
  firstName: yup.string().required().min(5).max(30),
  lastName: yup.string().required().min(5).max(30),
  location: yup.string().required(),
  occupation: yup.string().required(),
  myFile: yup.string().required(),
});
