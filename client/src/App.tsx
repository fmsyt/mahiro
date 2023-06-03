import React from 'react';
import logo from './logo.svg';
import './App.css';
import Controller from './controller';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Controller />
      </header>
    </div>
  );
}

export default App;
