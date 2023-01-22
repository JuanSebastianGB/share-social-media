import { loginAdapter } from '@/adapters';
import { loginInitialValues, LoginModel } from '@/models';
import { makeLogin } from '@/redux/states/authSlice';
import { loginSchema } from '@/schemas';
import { loginService } from '@/services';
import {
  errorToastMessageConfig,
  successToastMessageConfig,
} from '@/utilities';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const useLogin = () => {
  const [error, setError] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayButton, setDisplayButton] = useState(true);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const onSubmit = async (values: LoginModel) => {
    try {
      setDisplayButton(false);
      setIsLoading(true);
      setIsError(false);
      setError({});
      const { data } = await loginService(values);
      setIsLoading(false);
      toast.success('(～￣▽￣)～ Logged in!', successToastMessageConfig);
      dispatch(makeLogin(loginAdapter(data)));
      setDisplayButton(true);
      navigate('/home');
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      setError({ error });
      setDisplayButton(true);
      toast.error('＞︿＜ You cant access', errorToastMessageConfig);
      console.log({ error });
      setTimeout(() => {
        setIsError(false);
        setError({});
      }, 2000);
    }
  };
  const {
    handleSubmit,
    getFieldProps,
    errors,
    touched,
    dirty,
    isValid,
    resetForm,
    handleBlur,
  } = useFormik({
    onSubmit,
    initialValues: loginInitialValues,
    validationSchema: loginSchema,
  });

  return {
    displayButton,
    handleSubmit,
    getFieldProps,
    errors,
    touched,
    dirty,
    isValid,
    resetForm,
    handleBlur,
    error,
    isError,
    isLoading,
  };
};
