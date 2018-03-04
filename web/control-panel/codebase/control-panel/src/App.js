import React, { Component } from 'react';
import './App.css';
import './fonts.css'
import {Dashboard} from './dashboard/Dashboard.js'
import {DashboardHeader} from './dashboard/DashboardHeader.js'

class App extends Component {
  constructor() {
    super();

    this.state = {
      researcher: undefined,
      permission: false
    }
  }

  componentDidMount() {
    this.renderButton();
  }

  renderButton() {
      window.gapi.signin2.render('my-signin2', {
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': console.log('yay'),
        'onfailure': console.log('oops')
      });
  }

  render() {
    const dashboard = <Dashboard />
    const dashboardHeader = <DashboardHeader />

    if (this.state.permission == false) { //================= NOT SIGNED IN
      return (
        <div className="App">
          <header className="App-header">
            {dashboardHeader}

          </header>

          <h1 className="App-title">You must log in to view this page</h1>
          <div className="signIn" id="my-signin2"></div>

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
