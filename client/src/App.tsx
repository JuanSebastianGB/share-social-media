import { CssBaseline } from '@mui/material';
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppStore } from './models';
import { Auth } from './pages';

const Home = lazy(() => import('@/pages/Home/Home'));
const Login = lazy(() => import('@/pages/Login/Login'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));
function App() {
  const mode = useSelector((store: AppStore) => store.auth.mode);
  const token = useSelector((store: AppStore) => store.auth.token);
  const isAuth = !!token;

  return (
    <div>
      <CssBaseline />
      <Suspense fallback={<div> Loading...</div>}>
        <div className="app">
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={isAuth ? <Navigate to="/home" /> : <Auth />}
              />
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
        </div>
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
    </div>
  );
}

export default App;
