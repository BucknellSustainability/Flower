import React, { Component } from 'react';
import './App.css';
import './fonts.css'
import Requests from './Requests.js'
import {Dashboard} from './dashboard/Dashboard.js'
import {DashboardHeader} from './dashboard/DashboardHeader.js'

import { Layout, Menu, Icon, Divider, Card } from 'antd';
const {Meta} = Card;


class App extends Component {
  constructor() {
    super();

    this.loadProfile = Requests.loadProfile.bind(this);
    this.handleSuccess = this.handleSuccess.bind(this);

    this.state = {
      signInState: 0,
      researcher: undefined,
      profileEmail: '',
      activeProject: 0,
      activeDevice: 0,
      token: undefined
    }
  }

  componentWillMount(){
    let signInState = sessionStorage.getItem("signInState");
    if (signInState === '1'){
      let gUser = JSON.parse(sessionStorage.getItem("gUser"))
      this.loadProfile(gUser)
    }
  }


  componentDidMount() {
    let signInState = sessionStorage.getItem("signInState");
    if((signInState === '0') || (signInState === null)){
      this.renderButton();
    }
  }

  handleSuccess(gUser){
    sessionStorage.setItem("gUser", JSON.stringify(gUser));
    this.loadProfile(gUser)
  }

  renderButton() {

    window.gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark',
      'onsuccess': this.handleSuccess,
      'onfailure': console.log('failed')
    });
  }

  signOut = () => {
    this.setState({researcher: undefined, signInState: 0, profileEmail: ''})
    window.location.reload();
  }

  requestAccess = () => {
    Requests.requestAcess(this.state.token);
    window.gapi.auth2.getAuthInstance().signOut().then(this.signOut);
  }

  render() {
    const dashboardHeader = <DashboardHeader email={this.state.profileEmail} gapi={window.gapi} signOut={this.signOut}/>

    if (this.state.signInState == 0) {
      return (
        <div className="App">

          <header className="App-header">
            {dashboardHeader}
          </header>

          <h1 className="App-title">Please sign in to view this page.</h1>
          <div className="raise signIn" id="my-signin2"></div>

        </div>
      );
    } else if (this.state.signInState == 1) {
      return (
          <Dashboard researcher={this.state.researcher}/>
      );
    } else{
      return (
        <div className="App">
          <header className="App-header">
            {dashboardHeader}
          </header>

          <h1 className="App-title">Permission Denied!</h1>
          <p className="App-sub-text">The button below will send an email to the administrator who can grant you access.</p>
          <button id="requestAccessButton" type="button" className="btn btn-default navbar-btn" onClick={this.requestAccess}>Sign Out & Request Access</button>

        </div>
      )
    }

  }
}

export default App;
