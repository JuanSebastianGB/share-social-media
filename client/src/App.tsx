import { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from './components';
import { store } from './redux';

const Home = lazy(() => import('@/pages/Home/Home'));
const Login = lazy(() => import('@/pages/Login/Login'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));
function App() {
  return (
    <Suspense fallback={<div> Loading...</div>}>
      <Provider store={store}>
        <div className="app">
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </Provider>
    </Suspense>
  );
}

export default App;
