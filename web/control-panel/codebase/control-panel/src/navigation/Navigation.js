import React from 'react';
import ReactDOM from 'react-dom';
import Requests from '../Requests.js'
import LoginPage from './Login.js';
import {Dashboard} from '../dashboard/Dashboard.js'
import {HashRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom';


class Navigation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: (localStorage.getItem('isAuth') === 'true'), //pull authentication from localstorage
      gUser: JSON.parse(localStorage.getItem('gUser')),              //store google user in localstorage
      researcher: undefined
    }; //navigation keeps track of authentication state

    //navigation controls login/logout 
    this.handleLogin =  Requests.loadProfile.bind(this);
    this.handleLogout = this.handleLogout.bind(this);

    //this.requestAccess = Requests.requestAccess.bind(this);
  }

  componentWillMount(){
    let isAuth = (localStorage.getItem("isAuth") === 'true');
    let gUser = JSON.parse(localStorage.getItem('gUser'));
    if (isAuth && gUser){
        this.handleLogin(gUser);
    }

    //init google gapi auth2 everytime any page loads
    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: '438120227370-65o4j0kmk9mbij1bp3dqvnts9dh4kfrf.apps.googleusercontent.com',
        fetch_basic_profile: true
      })
          .then((auth2)=>{
            window.gapi.auth2 = auth2;

              //if google has user signed in but not authenticated in our system force logout
            if (auth2.isSignedIn.get() && !isAuth) {
              this.handleLogout();
            }
          })
          .catch((reason)=>{
            console.log('auth2.init failed with: ' + reason.error);
            console.log(reason.details);
          });
    });
  }

  requestAccess() {
    this.requestAcess();
  }

  handleLogout() {
    window.gapi.auth2.signOut()
      .then(()=>{
        localStorage.setItem('gUser', undefined);
        localStorage.setItem('isAuth', false);
        this.setState({ gUser: null, isAuthenticated: false});
      });
  }

  getDashboard(){
    if(this.state.researcher !== undefined){
      return (
          <Dashboard researcher={this.state.researcher}/>
        )
      }
    else{
      return (<p></p>)
    }
  }

  render() {
    let isAuth = this.state.isAuthenticated;
    return (

        <Router>
          <div style={{height:"100%"}}>
            <Route exact path='/login'
                render={(routeProps) => (isAuth) ? (
                  <Redirect
                    to={{
                      pathname: '/',
                      state: { from: routeProps.location }
                    }} />
              ) : (
                <LoginPage {...routeProps} login={this.handleLogin} gUser={this.state.gUser}/>
            )} />

            <Route exact path='/'
                render={(routeProps) => isAuth ? (
                    this.getDashboard()
                  ) : (
                    <Redirect
                      to={{
                        pathname: '/login',
                        state: { from: routeProps.location }
                      }}
                    />
                  )
                }
              />
            </div>
        </Router>
    );
  }
}

export default Navigation;