import { RegisterInitialValues, RegisterModel } from '@/models';
import { registerSchema } from '@/schemas';
import { Button, TextField } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
export interface Props {}

const onSubmit = (values: RegisterModel, onSubmitProps: any) => {
  console.log(values);
};

const AuthRegister: React.FC<Props> = () => {
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
    initialValues: RegisterInitialValues,
    validationSchema: registerSchema,
  });
  return (
    <>
      <form onSubmit={handleSubmit}>
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
        <TextField
          {...getFieldProps('picture')}
          label="picture"
          helperText={errors.picture && touched.picture && errors.picture}
          error={!!errors.picture && touched.picture}
          onBlur={handleBlur}
        />

        <Button type="submit">Register</Button>
      </form>
    </>
  );
};

export default AuthRegister;
