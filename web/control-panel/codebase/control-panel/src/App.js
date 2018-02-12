import React, { Component } from 'react';
import logo from './images/logo.svg';
import './App.css';
import {Dashboard} from './Dashboard.js'


class App extends Component {
  render() {
    const dashboard = <Dashboard />
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Energy Hill Dashboard</h1>
        </header>
        {dashboard}
        
      </div>
    );
  }
}

export default App;
