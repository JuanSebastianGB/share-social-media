import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header, Scroll, SkeletonDefault, Spinner } from './components';
import { AppStore } from './models';
import { makeTheme } from './utilities';

const Home = lazy(() => import('@/pages/Home/Home'));
const AuthLogin = lazy(() => import('@/pages/Auth/AuthLogin/AuthLogin'));
const AuthRegister = lazy(
  () => import('@/pages/Auth/AuthRegister/AuthRegister')
);
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));

function App() {
  const mode = useSelector((store: AppStore) => store.auth.mode);
  const token = useSelector((store: AppStore) => store.auth.token);
  const isAuth = !!token;

  return (
    <ThemeProvider theme={makeTheme(mode)}>
      <CssBaseline />
      <Scroll showBelow={250} />
      <Suspense fallback={<Spinner />}>
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
              />
              <Route
                path="/home"
                element={isAuth ? <Home /> : <Navigate to="/" />}
              />
              <Route
                path="/profile/:id"
                element={isAuth ? <Profile /> : <Navigate to="/" />}
              />
              <Route path="/skeleton" element={<SkeletonDefault />} />
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
