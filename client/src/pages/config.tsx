import React from 'react';
import ReactDOM from 'react-dom/client';
import ConfigApp from '../ConfigApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ConfigApp />
  </React.StrictMode>
);
