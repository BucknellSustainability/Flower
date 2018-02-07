import React, { Component } from 'react';
import logo from './images/logo.svg';
import './DeviceContainer.css';
import Button from 'react-bootstrap/lib/Button';
import Panel from 'react-bootstrap/lib/Panel';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Checkbox from 'react-bootstrap/lib/Checkbox'
import Col from 'react-bootstrap/lib/Col'
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

      {this.props.device.sensors.map((sensor, i) =>
        <Panel eventKey={i} id={i} bsStyle="info">
          <Panel.Heading>
            <Panel.Title componentClass="h2" toggle>{sensor.name}</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <Form inline>
                <FormGroup controlId="basicSensorInfo">
                    <ControlLabel>Sensor Name</ControlLabel>{' '}
                    <FormControl type="text" placeholder={sensor.name} />
                </FormGroup>{' '}
                <FormGroup controlId="formInlineUnits">
                    <ControlLabel>Units</ControlLabel>{' '}
                    <FormControl type="text" placeholder={sensor.id} />
                </FormGroup>
                <FormGroup controlId="sensorRanges">
                    <ControlLabel>Lower Limit</ControlLabel>{' '}
                    <FormControl type="number" placeholder="0" />
                </FormGroup>{' '}
                <FormGroup controlId="formInlineUnits">
                    <ControlLabel>Upper Limit</ControlLabel>{' '}
                    <FormControl type="number" placeholder="100" />
                </FormGroup>
            </Form>
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