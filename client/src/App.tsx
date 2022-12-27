import { Provider } from 'react-redux';
import { GiveName, ResetUser, Test } from './components';
import { store } from './redux';

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <p>Initial Setup</p>
        <Test />
        <GiveName />
        <ResetUser />
      </div>
    </Provider>
  );
}

export default App;
