import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

import.meta.env.DEV && console.log(import.meta.env);

root.render(
  <React.StrictMode>
    <App disableDrawer={true} />
  </React.StrictMode>
);
