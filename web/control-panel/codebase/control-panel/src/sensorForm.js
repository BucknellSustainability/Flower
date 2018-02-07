import React, { Component } from 'react';
import {Button, Panel, Form, FormGroup, FormControl, HelpBlock, ControlLabel, Row, Col} from 'react-bootstrap'

export class SensorForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      name: this.props.sensor.name,
      units: this.props.sensor.id, //TODO: need to figure out data lifecycle
      limHigh: 0,
      limLow: 100,
      maxLength: 20
    };
  }

  ComponentWillMount() {
    //update any changes to sensor info
  }

  handleSubmit = () => {
    //update database
    //check validation state before continuing
    console.log("Submit button pressed! Nothing happened.");
  }

  handleChangeName = (e) => {
    this.setState({
      name: e.target.value
    });
  }

  handleChangeUnits = (e) => {
    this.setState({
      units: e.target.value
    });
  }

  handleChangeHigh = (e) => {
    this.setState({
      limHigh: e.target.value
    });
  }

  handleChangeLow = (e) => {
    this.setState({
      limLow: e.target.value
    });
  }

  noValidation() { //used for input fields where there is no way to screw up, but you still want to let the user know they are doing a good job
    return "success";
  }

  getValidationStateNameUnits(field) {
    if (field.length > this.state.maxLength) {
      return "error";
    } else {
      return "success";
    }
  }


  render() {
    var sensor = this.props.sensor;
    return (
      <Form>
        <Row className="sensorRow">
          <Col md={6}>
            <FormGroup
              controlId="basicSensorInfo"
              validationState={this.getValidationStateNameUnits(this.state.name)}>
                <ControlLabel>Sensor Name</ControlLabel>{' '}
                <FormControl
                  type="text"
                  value={this.state.name}
                  onChange={this.handleChangeName}/>
                <FormControl.Feedback />
                <HelpBlock>{this.state.maxLength} character limit</HelpBlock>
            </FormGroup>{' '}
            <FormGroup
              controlId="formInlineUnits"
              validationState={this.getValidationStateNameUnits(this.state.units)}>
                <ControlLabel>Units</ControlLabel>{' '}
                <FormControl
                  type="text"
                  value={this.state.units}
                  onChange={this.handleChangeUnits}/>
                <FormControl.Feedback />
                <HelpBlock>{this.state.maxLength} character limit</HelpBlock>
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup
              controlId="sensorRanges"
              validationState={this.noValidation()}>
                <ControlLabel>Lower Limit</ControlLabel>{' '}
                <FormControl
                  type="number"
                  value={this.state.limHigh}
                  onChange={this.handleChangeHigh}/>
                <FormControl.Feedback />
            </FormGroup>{' '}
            <FormGroup
              controlId="formInlineUnits"
              validationState={this.noValidation()}>
                <ControlLabel>Upper Limit</ControlLabel>{' '}
                <FormControl
                  type="number"
                  value={this.state.limLow}
                  onChange={this.handleChangeLow}/>
                <FormControl.Feedback />
            </FormGroup>
          </Col>
        </Row>
      </Form>
    );}
  }
