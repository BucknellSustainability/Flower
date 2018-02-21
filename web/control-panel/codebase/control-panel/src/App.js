import React, { Component } from 'react';
import './App.css';
import './fonts.css'
import {Dashboard} from './dashboard/Dashboard.js'
import {DashboardHeader} from './dashboard/DashboardHeader.js'

class App extends Component {
  render() {
    const dashboard = <Dashboard />
    const dashboardHeader = <DashboardHeader />
    return (
      <div className="App">
        <header className="App-header">
          {dashboardHeader}

        </header>

        {dashboard}
        
      </div>
    );
  }
}

export default App;
