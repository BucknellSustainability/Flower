import React, { Component } from 'react';
import './DeviceNav.css';
import '../../../fonts.css';
import {Button, Nav, NavItem, Well, Row, Col, Panel, Badge} from 'react-bootstrap/lib/';


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
    this.props.handler(selectedKey);
  }

  render() {
    let index=0;
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
                          <Nav className="device-nav" bsStyle="pills" stacked activeKey={this.props.device} onSelect={this.handleSelect}>
                              {this.props.devices.map((device, i) =>
                                <NavItem eventKey={i} className="raise concert"> <Badge style={{marginRight:5}}> {device.id} </Badge> {device.name}</NavItem>
                              )}
                        </Nav>
                    </Well>
                    </Panel.Body>
                  </Panel>
          </div>


    );
  }
}