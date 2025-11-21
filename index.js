import React from 'https://esm.sh/react@19.2.0';
import ReactDOM from 'https://esm.sh/react-dom@19.2.0/client';
import App from './App.js';

const rootEL = document.getElementById('root');

if (rootEL) {
  const root = ReactDOM.createRoot(rootEL);
  root.render(
    React.createElement(React.StrictMode, null, React.createElement(App))
  );
}
