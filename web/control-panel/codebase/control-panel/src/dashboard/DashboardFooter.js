import React, { Component } from 'react';
import logo from '../images/logo.svg';
import '../fonts.css'
import {Navbar} from 'react-bootstrap/lib/'
import {Button} from 'antd'

export class DashboardFooter extends Component {
  constructor() {
    super();
    this.signOut = this.signOut.bind(this);
  }

  signOut = () => {
    var auth2 = this.props.gapi.auth2.getAuthInstance();

    auth2.signOut().then(function () {
      console.log('user was signed out');
    });

    this.props.signOut();
  }

  render() {
    let signedInAs = null;
    let btnSignOut = null;
    if (this.props.email != '') {
      btnSignOut = <Button icon="google" onClick={this.signOut} 
                           style={{background:"white", marginLeft: 10, marginBottom: 0}}> Sign Out 
                    </Button>
      signedInAs = "Signed in as:"
    }

    return (
      <div>
        <Navbar className="App-Nav">
            <Navbar.Header>
              <Navbar.Brand>
                <a href="#home"><img src={logo} className="App-logo" alt="logo" /></a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Navbar.Text>
                    <h2 style={{marginBottom:0}} className="white bold ubuntu">Energy Hill Dashboard</h2>
              </Navbar.Text>
              <Navbar.Text className="App-sub-text ubuntu" style={{color:"white"}} pullRight>{signedInAs}
                  {" " + this.props.email + " "}
                {btnSignOut}
              </Navbar.Text>
            </Navbar.Collapse>
          </Navbar>
      </div>
    );
  }
}