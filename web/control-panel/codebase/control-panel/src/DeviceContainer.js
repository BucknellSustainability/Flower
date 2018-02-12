import React, { Component } from 'react';
import logo from './images/logo.svg';
import './DeviceContainer.css';
import {SensorForm} from './sensorForm.js'
import {Button, Panel, PanelGroup, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col} from 'react-bootstrap'
import axios from 'axios';


export class DeviceContainer extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      index: 0,
      direction: null,
    };
  }

  handleSelect(activeKey) {
    this.setState({ activeKey });
  }

  render() {
    const { index, direction } = this.state;
    return (

      <div>
      <PanelGroup
        accordion
        id="accordion-controlled-example"
        activeKey={this.state.activeKey}
        onSelect={this.handleSelect}
      >

      {this.props.device.sensors.map((sensor_i, i) =>
        <Panel eventKey={i} id={i} bsStyle="info">
          <Panel.Heading>
            <Panel.Title componentClass="h2" toggle>{sensor_i.name}</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <SensorForm sensor = {sensor_i}/>
            <br/>
            <Button type="submit">Submit Changes</Button>
          </Panel.Body>
        </Panel>
      )}

      </PanelGroup>


      </div>


    );
  }
}
