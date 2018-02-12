import React, { Component } from 'react';
import './DeviceNav.css';
import Button from 'react-bootstrap/lib/Button';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Well from 'react-bootstrap/lib/Well'


export class DeviceNav extends Component{
  constructor(props){
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.state = {activeKey : 0}
  }

  componentDidMount(){
    //fetch
  }

  handleSelect(selectedKey) {
    this.setState({activeKey: selectedKey});
    this.props.handler(selectedKey);
  }

  render() {
    return (
          <div id="deviceNav">
              <Well bsSize="small">
                  <h4> Devices </h4>
                  <Nav bsStyle="pills" stacked activeKey={this.state.activeKey} onSelect={this.handleSelect}>
                      {this.props.devices.map((device, i) =>
                        <NavItem eventKey={i}>{device.name}</NavItem>
                      )}
                </Nav>
            </Well>
          </div>
    );
  }
}