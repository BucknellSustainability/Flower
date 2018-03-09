import React, { Component } from 'react';
import logo from '../images/logo.svg';
import '../fonts.css'
import {Navbar} from 'react-bootstrap/lib/'

export class DashboardHeader extends Component {
  render() {
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
              <Navbar.Text className="App-sub-text concert" pullRight>Signed in as: <Navbar.Link className="App-sub-text" href="#">jav017@bucknell.edu</Navbar.Link></Navbar.Text>
            </Navbar.Collapse>
          </Navbar>
      </div>
    );
  }
}