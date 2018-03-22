import React, { Component } from 'react';
import logo from '../images/logo.svg';
import '../fonts.css'
import {Navbar} from 'react-bootstrap/lib/'

export class DashboardHeader extends Component {
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
      btnSignOut = <button type="button" className="btn btn-default navbar-btn" onClick={this.signOut}>Sign Out</button>
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
                    <h2 className="App-title bold concert">Energy Hill Dashboard</h2>
              </Navbar.Text>
              <Navbar.Text className="App-sub-text concert" pullRight>{signedInAs}
                <Navbar.Link className="App-sub-text" href="#">
                  {" " + this.props.email + " "}
                </Navbar.Link>
                {btnSignOut}
              </Navbar.Text>
            </Navbar.Collapse>
          </Navbar>
      </div>
    );
  }
}
