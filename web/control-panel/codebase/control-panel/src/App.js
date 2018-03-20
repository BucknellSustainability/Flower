import React, { Component } from 'react';
import './App.css';
import './fonts.css'
import {Dashboard} from './dashboard/Dashboard.js'
import {DashboardHeader} from './dashboard/DashboardHeader.js'

class App extends Component {
  constructor() {
    super();
    this.loadProfile = this.loadProfile.bind(this);

    this.state = {
      researcher: undefined,
      permission: false,
      idtoken: 0
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
    // TODO: make this address dynamic
    xhr.open('POST', 'http://linuxremote1.bucknell.edu:5001/get-profile');
    xhr.withCredentials = true;
    xhr.responseType = 'json';

    const scope = this;
    xhr.onload = function() {
      //if use is verified
      if(xhr.response !== ""){
        scope.setState({researcher: xhr.response, permission: true, idtoken: id_token})
      }
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
    const dashboard = <Dashboard researcher={this.state.researcher}  token={this.state.idtoken}/>
    const dashboardHeader = <DashboardHeader />

    if (this.state.permission === false) { //================= NOT SIGNED IN
      return (
        <div className="App">
          <header className="App-header">
            {dashboardHeader}

          </header>

          <h1 className="App-title concert bold">You must log in to view this page</h1>
          <div className="signIn raise" id="my-signin2"></div>

        </div>
      );//
    } else { //============================================ PROFILE STILL LOADING
      if (typeof this.state.researcher === 'undefined') {
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
