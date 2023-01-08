import {
  Box,
  createTheme,
  CssBaseline,
  PaletteMode,
  ThemeProvider,
} from '@mui/material';
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from './components';
import { AppStore } from './models';
import { AuthLogin, AuthRegister } from './pages';

const Home = lazy(() => import('@/pages/Home/Home'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));

const colorsPalette = {
  primary: {
    100: '#ffba08',
    200: '#faa307',
    300: '#f48c06',
    400: '#e85d04',
    500: '#dc2f02',
    600: '#d00000',
    700: '#9d0208',
    800: '#6a040f',
    900: '#370617',
    1000: '#03071e',
  },
  grey: {
    100: '#f8f9fa',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
    1000: '#000000',
  },
};

const makeTheme = (mode: PaletteMode | undefined) => {
  return createTheme({
    typography: {
      fontFamily: ['"Rubik"', '"Montserrat"', 'sans-serif'].join(','),
    },
    palette: {
      mode,
      ...(mode !== 'dark'
        ? {
            primary: {
              light: colorsPalette.primary[200],
              main: colorsPalette.primary[500],
              dark: colorsPalette.primary[900],
            },
            neutral: {
              dark: colorsPalette.grey[800],
              main: colorsPalette.grey[600],
              mediumMain: colorsPalette.grey[400],
              medium: colorsPalette.grey[300],
              light: colorsPalette.grey[200],
            },
            background: {
              default: colorsPalette.grey[200],
              paper: colorsPalette.grey[100],
            },
          }
        : {
            primary: {
              light: colorsPalette.primary[1000],
              main: colorsPalette.primary[400],
              dark: colorsPalette.primary[200],
            },
            neutral: {
              dark: colorsPalette.grey[100],
              main: colorsPalette.grey[200],
              mediumMain: colorsPalette.grey[300],
              medium: colorsPalette.grey[400],
              light: colorsPalette.grey[700],
            },
            background: {
              default: colorsPalette.grey[700],
              paper: colorsPalette.grey[900],
            },
          }),
    },
  });
};
function App() {
  const mode = useSelector((store: AppStore) => store.auth.mode);
  const token = useSelector((store: AppStore) => store.auth.token);
  const isAuth = !!token;

  return (
    <ThemeProvider theme={makeTheme(mode)}>
      <CssBaseline />
      <Suspense fallback={<div> Loading...</div>}>
        <Box
          sx={{
            minHeight: '100vh',
            width: '100%',
          }}
          className="app"
        >
          {!isAuth && <Header title="social media share" />}

          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={isAuth ? <Navigate to="/home" /> : <AuthLogin />}
              />
              <Route
                path="/register"
                element={isAuth ? <Navigate to="/home" /> : <AuthRegister />}
              ></Route>
              <Route
                path="/home"
                element={isAuth ? <Home /> : <Navigate to="/" />}
              />
              <Route
                path="/profile/:id"
                element={isAuth ? <Profile /> : <Navigate to="/" />}
              />
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Box>
      </Suspense>

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>
  );
}

export default App;
