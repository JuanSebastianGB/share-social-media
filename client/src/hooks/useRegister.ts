import { RegisterModel } from '@/models';
import { registerService } from '@/services';
import {
  errorToastMessageConfig,
  successToastMessageConfig,
} from '@/utilities';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const useRegister = () => {
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [displayButton, setDisplayButton] = useState(true);

  const navigate = useNavigate();
  let controller = new AbortController();

  const onSubmit = async (values: RegisterModel, onSubmitProps: any) => {
    const form = new FormData();
    // @ts-ignore
    for (let value in values) form.append(value, values[value]);
    form.append('picturePath', !!values.myFile ? values.myFile.name : '');

    const { signal } = controller;

    try {
      setError(false);
      setIsLoading(true);
      setDisplayButton(false);
      const response = await registerService(form, { signal });
      console.log({ response });
      setIsLoading(false);
      onSubmitProps.resetForm();
      toast.success('Registered successfully!', successToastMessageConfig);
      setDisplayButton(true);
      navigate('/');
    } catch (error) {
      setIsLoading(false);
      setDisplayButton(true);
      if (signal.aborted) return;
      setIsError(true);
      console.log({ error });
      setError({ error });
      toast.error('Something went wrong!', errorToastMessageConfig);
      setTimeout(() => {
        setIsError(false);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => controller.abort();
  }, []);

  return { onSubmit, error, displayButton, isLoading, isError };
};
