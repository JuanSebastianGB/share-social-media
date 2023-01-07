import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from './components';
import { AppStore } from './models';
import { AuthLogin, AuthRegister } from './pages';

const Home = lazy(() => import('@/pages/Home/Home'));
const Login = lazy(() => import('@/pages/Login/Login'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));

const theme = createTheme({
  typography: {
    fontFamily: ['"Rubik"', '"Montserrat"', 'sans-serif'].join(','),
  },
});

const makeTheme = (mode: string) => {
  return createTheme({
    typography: {
      fontFamily: ['"Rubik"', '"Montserrat"', 'sans-serif'].join(','),
    },
    ...(mode === 'dark' && { palette: { mode: 'dark' } }),
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
