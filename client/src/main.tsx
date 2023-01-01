import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { persistStore } from 'redux-persist';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { AxiosInterceptor } from './interceptors';
import { store } from './redux/store';

AxiosInterceptor();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistStore(store)}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
