import React, { Component } from 'react';
import '../../fonts.css'
import {Button, ButtonGroup, Modal, Row, Col, Form, FormGroup, FormControl ,ControlLabel, FormLabel, HelpBlock} from 'react-bootstrap'

export class ClaimDeviceForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleNameChange = this.handleNameChange.bind(this);

    this.state = {
      deviceName: ''
    };
  }

  getNameValidationState() {
    const length = this.state.deviceName.length;
    if (length > 0) return 'success';
    else return 'error'
  }

  handleNameChange(e) {
    this.setState({ deviceName: e.target.value });
  }

  render() {
    return (
    	<div>
        <div className="card-header">
          <h3 className="concert bold card cardTitle"> Arduino: </h3> <h4 className="cardSubtitle">{this.props.device.hardwareId} </h4>
        </div>
        <div className="card-block">

			      <form>
			        <FormGroup
			          controlId="formBasicText"
			          validationState={this.getNameValidationState()}
			        >
			          <h5 className="text-left concert">Name Your Device</h5>
			          <FormControl
			          	className="concert"
			            type="text"
			            value={this.state.deviceName}
			            placeholder="Enter text"
			            onChange={this.handleNameChange}
			          />
			          <FormControl.Feedback />
			          <HelpBlock className="concert">Required</HelpBlock>
			          <Button className="concert">Claim Device</Button>
			        </FormGroup>
			      </form>
       

        </div>
        <div className="card-footer text-muted">
          Discovered: 2 days ago
       </div>
       </div>

    );
  }
}