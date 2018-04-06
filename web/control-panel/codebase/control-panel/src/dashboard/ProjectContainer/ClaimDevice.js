import React, { Component } from 'react';
import Requests from '../../Requests.js'
import '../../fonts.css';
import {ClaimDeviceForm} from './ClaimDeviceForm.js';
import {Button, Row, Col} from 'antd'
import {Modal, Form, FormGroup, FormControl ,ControlLabel, FormLabel, HelpBlock} from 'react-bootstrap';

export class ClaimDevice extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.handleHide = this.handleHide.bind(this);
    this.showModal = this.showModal.bind(this)
    this.getUnclaimedDevices = Requests.getUnclaimedDevices.bind(this);

    this.state = {
      show: false,
      unclaimedDevices: []
    };
  }

  handleHide() {
    this.setState({ show: false });
  }

  showModal(){
    this.setState({show: true})
  }

  renderUnclaimed(){
    if(this.state.unclaimedDevices.length > 0){
      return (
        this.state.unclaimedDevices.map((device, i) =>
                <Col key={i} span={11}>
                  <div className="card text-center card-inverse unclaimed-device">
                      <ClaimDeviceForm device={device} activeProject={this.props.activeProject} token={this.props.token}> </ClaimDeviceForm>
                  </div>
                </Col>
        )
      )
    }
  }

  componentWillMount(){
      this.getUnclaimedDevices();
  }



  render() {
    return (
            <Row type="flex" justify="space-around" align="top" style={{padding:"2%"}}>
              {this.renderUnclaimed()}
            </Row>
    );
  }
}
