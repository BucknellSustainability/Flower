import React, { Component } from 'react';
import logo from '../images/logo.svg';
import '../App.css'


const styles = {
  container: {
    zIndex: 3,
    height: '55%',
    width: '40%',
    minWidth: '450px',
    marginTop: '200px',
    justifyContent: 'center',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'white'
  }
};

/*
Page responsible for logging the user in
*/
class LoginPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.drawsignin();
  }
  componentDidUpdate(prevProps, prevState) {
    this.drawsignin();
  }

  drawsignin() {
    window.gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark',
      'onsuccess': this.props.login,
      'onfailure': (error) => console.log(error)
    });
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    return (
        <div>
            <div style={{position:"absolute", top:"20%", right:"40%"}} className="my-signin2-body">
              <h1 className="ubuntu bold">Energy Hill Dashboard</h1>
              <div id="my-signin2" style={{position:"absolute", right:"18%"}}/>
            </div>
        </div>
    );
  }
}

export default LoginPage;