import { Error } from '@/components';
import { Dropzone } from '@/components/Dropzone';
import {
  errorInitialState,
  RegisterInitialValues,
  RegisterModel,
} from '@/models';
import { registerSchema } from '@/schemas';
import { registerService } from '@/services';
import {
  errorToastMessageConfig,
  successToastMessageConfig,
} from '@/utilities';
import { Button, TextField } from '@mui/material';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
export interface Props {}

const AuthRegister: React.FC<Props> = () => {
  const [error, setError] = useState(errorInitialState);
  const navigate = useNavigate();

  const onSubmit = async (values: RegisterModel, onSubmitProps: any) => {
    const form = new FormData();
    for (let value in values) form.append(value, values[value]);

    form.append('picturePath', !!values.myFile ? values.myFile.name : '');
    console.log(form);
    try {
      const response = await registerService(form);
      console.log(response);
      onSubmitProps.resetForm();
      toast.success(
        `(●'◡'●) Registered successfully!`,
        successToastMessageConfig
      );
      navigate('/login');
    } catch (error: any) {
      console.log(error);
      const { data, status, statusText } = error.response;
      setError({ data, status, statusText });
      toast.error('😑😑 Something went wrong!', errorToastMessageConfig);
      setTimeout(() => {
        setError(errorInitialState);
      }, 2000);
    }
  };
  const {
    values: valuesForm,
    setFieldValue,
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
    initialValues: RegisterInitialValues,
    validationSchema: registerSchema,
  });

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Dropzone setFieldValue={setFieldValue} />
        <TextField
          {...getFieldProps('firstName')}
          label="first name"
          helperText={errors.firstName && touched.firstName && errors.firstName}
          error={!!errors.firstName && touched.firstName}
          onBlur={handleBlur}
        />
        <TextField
          {...getFieldProps('lastName')}
          label="last name"
          helperText={errors.lastName && touched.lastName && errors.lastName}
          error={!!errors.lastName && touched.lastName}
          onBlur={handleBlur}
        />
        <TextField
          {...getFieldProps('email')}
          label="Email"
          helperText={errors.email && touched.email && errors.email}
          error={!!errors.email && touched.email}
          onBlur={handleBlur}
        />
        <TextField
          {...getFieldProps('password')}
          label="Password"
          helperText={errors.password && touched.password && errors.password}
          error={!!errors.password && touched.password}
          onBlur={handleBlur}
        />

        <TextField
          {...getFieldProps('location')}
          label="location"
          helperText={errors.location && touched.location && errors.location}
          error={!!errors.location && touched.location}
          onBlur={handleBlur}
        />
        <TextField
          {...getFieldProps('occupation')}
          label="occupation"
          helperText={
            errors.occupation && touched.occupation && errors.occupation
          }
          error={!!errors.occupation && touched.occupation}
          onBlur={handleBlur}
        />

        <Button type="submit">Register</Button>
      </form>
      {error?.data && (
        <ul>
          {error?.data?.errors ? (
            <Error errorList={error?.data?.errors} />
          ) : (
            <Error errorString={error.data} />
          )}
        </ul>
      )}
    </>
  );
};

export default AuthRegister;
