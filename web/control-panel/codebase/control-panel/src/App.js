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

  loadProfile(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;

    var form_data = new FormData();
    form_data.append('idtoken', id_token);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5000/get-profile');
    xhr.withCredentials = true;
    xhr.onload = function() {
      console.log(xhr.responseText);
    };
    xhr.send(form_data);
  }

  renderButton() {
      window.gapi.signin2.render('my-signin2', {
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': this.loadProfile,
        'onfailure': console.log('failed')
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
