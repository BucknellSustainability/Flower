import React, { Component } from 'react';


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
        <div style={{marginTop: '150px'}}>
            <h1 style={{marginTop: '4px', marginBottom: '0px'}}>Bucknell Books</h1>
            <div className="my-signin2-body">
              <div id="my-signin2" style={{marginBottom: '8px'}}/>
            </div>
        </div>
    );
  }
}

export default LoginPage;