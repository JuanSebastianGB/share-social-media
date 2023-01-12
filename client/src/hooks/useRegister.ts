import { errorInitialState, RegisterModel } from '@/models';
import { registerService } from '@/services';
import {
  errorToastMessageConfig,
  successToastMessageConfig,
} from '@/utilities';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * It takes in a form, sends it to the server, and then returns the response
 * @returns An object with the onSubmit function, error state and displayButton state.
 */
export const useRegister = () => {
  const [error, setError] = useState(errorInitialState);
  const [displayButton, setDisplayButton] = useState(true);

  const navigate = useNavigate();

  const onSubmit = async (values: RegisterModel, onSubmitProps: any) => {
    const form = new FormData();
    for (let value in values) form.append(value, values[value]);
    form.append('picturePath', !!values.myFile ? values.myFile.name : '');

    console.log([...form]);
    try {
      setDisplayButton(false);
      const response = await registerService(form);
      console.log(response);
      onSubmitProps.resetForm();
      toast.success(
        `(●'◡'●) Registered successfully!`,
        successToastMessageConfig
      );
      onSubmitProps.resetForm();
      setDisplayButton(true);
      navigate('/');
    } catch (error: any) {
      setDisplayButton(true);
      console.log({ error });
      const { data, status, statusText } = error.response;
      setError({ data, status, statusText });
      toast.error('😑😑 Something went wrong!', errorToastMessageConfig);
      setTimeout(() => {
        setError(errorInitialState);
      }, 2000);
    }
  };

  return { onSubmit, error, displayButton };
};
