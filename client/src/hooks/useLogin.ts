import { loginAdapter } from '@/adapters';
import { errorInitialState, loginInitialValues, LoginModel } from '@/models';
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
  const navigate = useNavigate();
  const [displayButton, setDisplayButton] = useState(true);

  const [error, setError] = useState(errorInitialState);
  const dispatch = useDispatch();
  const onSubmit = async (values: LoginModel, onSubmitProps: any) => {
    try {
      setDisplayButton(false);
      const { data } = await loginService(values);
      toast.success(`(～￣▽￣)～ Logged in!`, successToastMessageConfig);
      dispatch(makeLogin(loginAdapter(data)));
      setDisplayButton(true);
      navigate('/home');
    } catch (error: any) {
      setDisplayButton(true);
      const { data, status, statusText } = error.response;
      setError({ data, status, statusText });
      toast.error('＞︿＜ You cant access', errorToastMessageConfig);
      setTimeout(() => {
        setError(errorInitialState);
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
  };
};
