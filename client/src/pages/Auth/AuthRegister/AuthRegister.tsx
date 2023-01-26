import { ErrorContent, Spinner } from '@/components';
import { Dropzone } from '@/components/Dropzone';
import { useRegister } from '@/hooks';
import { RegisterInitialValues } from '@/models';
import { registerSchema } from '@/schemas';
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import { Link } from 'react-router-dom';
import { StyledRegisterAuth } from './styles';
export interface Props {}

const AuthRegister: React.FC<Props> = () => {
  const { onSubmit, error, displayButton, isError, isLoading } = useRegister();

  const {
    setFieldValue,
    handleSubmit,
    getFieldProps,
    errors,
    touched,
    handleBlur,
  } = useFormik({
    onSubmit,
    initialValues: RegisterInitialValues,
    validationSchema: registerSchema,
  });
  const isMobileScreen = useMediaQuery('(max-width: 800px)');

  return (
    <StyledRegisterAuth
      elevation={7}
      sx={{
        width: isMobileScreen ? '93%' : '50%',
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            '& > div': {
              gridColumn: isMobileScreen ? 'span 4' : undefined,
            },
            gap: '1.5rem',
            width: '100%',
          }}
        >
          <Box sx={{ gridColumn: 'span 4' }}>
            <Dropzone
              setFieldValue={setFieldValue}
              fileName="myFile"
              isError={!!errors?.myFile}
            />
            {errors?.myFile && (
              <Typography align="center" variant="body1" color="#d32f2f">
                Missing File
              </Typography>
            )}
          </Box>
          <TextField
            {...getFieldProps('firstName')}
            label="first name"
            helperText={
              errors.firstName && touched.firstName && errors.firstName
            }
            error={!!errors.firstName && touched.firstName}
            onBlur={handleBlur}
            sx={{ gridColumn: '1/3' }}
          />
          <TextField
            {...getFieldProps('lastName')}
            label="last name"
            helperText={errors.lastName && touched.lastName && errors.lastName}
            error={!!errors.lastName && touched.lastName}
            onBlur={handleBlur}
            sx={{ gridColumn: '3/5' }}
          />
          <TextField
            {...getFieldProps('email')}
            label="Email"
            helperText={errors.email && touched.email && errors.email}
            error={!!errors.email && touched.email}
            onBlur={handleBlur}
            sx={{ gridColumn: 'span 4' }}
          />
          <TextField
            {...getFieldProps('password')}
            type="password"
            label="Password"
            autoComplete="off"
            helperText={errors.password && touched.password && errors.password}
            error={!!errors.password && touched.password}
            onBlur={handleBlur}
            sx={{ gridColumn: 'span 4' }}
          />
          <TextField
            {...getFieldProps('location')}
            label="location"
            helperText={errors.location && touched.location && errors.location}
            error={!!errors.location && touched.location}
            onBlur={handleBlur}
            sx={{ gridColumn: 'span 4' }}
          />
          <TextField
            {...getFieldProps('occupation')}
            label="occupation"
            helperText={
              errors.occupation && touched.occupation && errors.occupation
            }
            error={!!errors.occupation && touched.occupation}
            onBlur={handleBlur}
            sx={{ gridColumn: 'span 4' }}
          />
          {displayButton && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ gridColumn: 'span 4' }}
            >
              Register
            </Button>
          )}
          {isLoading && <Spinner sx={{ gridColumn: 'span 4' }} />}
          {isError && (
            <ErrorContent
              // @ts-ignore
              message={error?.error?.message}
              // @ts-ignore
              data={error?.error?.response.data}
              sx={{ gridColumn: 'span 4' }}
            />
          )}

          <Link className="link" to="/">
            Already have an account? Login here.
          </Link>
        </Box>
      </Box>
    </StyledRegisterAuth>
  );
};

export default AuthRegister;
