import React, { Component } from 'react';
import './App.css';
import './fonts.css'
import {Dashboard} from './dashboard/Dashboard.js'
import {DashboardHeader} from './dashboard/DashboardHeader.js'

class App extends Component {
  constructor() {
    super();

    this.state = {
      researcher: "just let the dashboard load",
      permission: true
    }
  }

  render() {
    const dashboard = <Dashboard />
    const dashboardHeader = <DashboardHeader />

    if (this.state.permission == false) { //================= PERMISSION DENIED
      return (
        <div className="App">
          <header className="App-header">
            {dashboardHeader}

          </header>

          <h1 className="App-title">You do not have permission to view this page!</h1>

        </div>
      );//
    } else { //============================================ PROFILE STILL LOADING
      if (typeof this.state.researcher == 'undefined') {
        return (
          <div className="App">
            <header className="App-header">
              {dashboardHeader}

            </header>

            <h1 className="App-title">Loading...</h1>

          </div>
        );
      } else { //========================================== PERMISSION GRANTED AND PROFILE LOADED
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
  }
}

export default App;
