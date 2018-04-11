import React, { Component } from 'react';
import Requests from '../../Requests.js'
import '../../fonts.css'
import {Button, ButtonGroup, Modal, Row, Col, Form, FormGroup, FormControl ,ControlLabel, FormLabel, HelpBlock} from 'react-bootstrap'

export class ClaimDeviceForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleNameChange = this.handleNameChange.bind(this);
    this.claimDevice = Requests.claimDevice.bind(this);

    this.state = {
      deviceName: '',
      deviceId: 0
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
			      <form>
             Discovered: {this.props.device.discovered}
			        <FormGroup
			          controlId="formBasicText"
			          validationState={this.getNameValidationState()}
			        >
			          <h5 className="text-left concert" style={{marginTop:10}}>Name Your Device</h5>
			          <FormControl
			          	className="concert"
			            type="text"
			            value={this.state.deviceName}
			            placeholder="Enter text"
			            onChange={this.handleNameChange}
			          />
			          <FormControl.Feedback />
			          <HelpBlock className="concert">Required</HelpBlock>
			          <Button 
                  className="concert"
                  onClick={() => {this.claimDevice()}}
                  >
                    Claim Device
                </Button>
			        </FormGroup>
			      </form>
       </div>

    );
  }
}
