import { loginInitialValues, LoginModel } from '@/models';
import { makeLogin } from '@/redux/states/authSlice';
import { loginSchema } from '@/schemas';
import { toHookErrorState, type HookErrorState } from '@/shared/lib/types/hook-error';
import {
  errorToastMessageConfig,
  successToastMessageConfig,
} from '@/shared/lib/utilities';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginAdapter } from '../model';
import { signIn } from './authGateway';

export const useLogin = () => {
  const [error, setError] = useState<HookErrorState | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayButton, setDisplayButton] = useState(true);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const controller = new AbortController();
  const { signal } = controller;
  const onSubmit = async (values: LoginModel) => {
    try {
      setDisplayButton(false);
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const session = await signIn(values, { signal });
      setIsLoading(false);
      toast.success('(～￣▽￣)～ Logged in!', successToastMessageConfig);
      dispatch(makeLogin(loginAdapter(session)));
      setDisplayButton(true);
      navigate('/home');
    } catch (err) {
      setIsLoading(false);
      if (signal.aborted) return;
      setIsError(true);
      setError(toHookErrorState(err));
      setDisplayButton(true);
      toast.error('＞︿＜ You cant access', errorToastMessageConfig);
      setTimeout(() => {
        setIsError(false);
        setError(null);
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

  useEffect(() => {
    return controller.abort();
  }, []);

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