import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


window.addEventListener('load', () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./serviceWorker.js");
  }
});
