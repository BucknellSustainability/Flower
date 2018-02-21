import React, { Component } from 'react';
import './DeviceNav.css';
import '../../../fonts.css';
import {Button, Nav, NavItem, Well, Row, Col, Panel} from 'react-bootstrap/lib/';


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
                <Panel className="device-nav-panel">
                  <Panel.Heading className="device-nav-panel-head">
                    <Panel.Title >
                        <Row>
                          <Col md={12}>
                              <h3 className="concert bold device-nav-title"> Devices </h3>
                          </Col>
                        </Row>
                    </Panel.Title>
                  </Panel.Heading>
                  <Panel.Body className="device-nav-body">
                      <Well className="device-nav-well" bsSize="small">
                          <Nav className="device-nav" bsStyle="pills" stacked activeKey={this.state.activeKey} onSelect={this.handleSelect}>
                              {this.props.devices.map((device, i) =>
                                <NavItem eventKey={i}>{device.name}</NavItem>
                              )}
                        </Nav>
                    </Well>
                    </Panel.Body>
                  </Panel>
          </div>


    );
  }
}