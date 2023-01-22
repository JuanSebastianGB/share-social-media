import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { persistStore } from 'redux-persist';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store } from './redux/store';
import { SpaceBetween } from './styled-components';
import { ErrorBoundary } from './utilities';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <StrictMode>
  <ErrorBoundary
    fallBackComponent={
      <SpaceBetween sx={{ height: '100vh', width: '100%' }}>
        Fatal error
      </SpaceBetween>
    }
  >
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistStore(store)}>
        <App />
      </PersistGate>
    </Provider>
  </ErrorBoundary>
  // </StrictMode>
);
