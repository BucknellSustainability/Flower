import React, { Component } from 'react';
import './DeviceContainer.css';
import '../../../fonts.css';
import {UploadCode} from './UploadCode.js';
import {SensorContainers} from './Sensors/SensorContainers.js';
import {Panel, Row, Col} from 'react-bootstrap'


export class DeviceContainer extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (

    <Panel className="device-container">
      <Panel.Heading className="device-container-header">
          <Panel.Title>
            <Row>
              <Col lg={6} md={6} sm={6} lgOffset={3} mdOffset={3} smOffset={3}>
                  <h3 className="device-container-title concert bold"> {this.props.device.name} </h3>
              </Col>
              <Col lg={3} md={3} sm={3}>
                  <UploadCode/>
              </Col>
            </Row>
          </Panel.Title>
      </Panel.Heading>
      <Panel.Body className="device-container-body">

          <SensorContainers sensors={this.props.device.sensors}/>

        </Panel.Body>
        </Panel>
    );
  }
}
