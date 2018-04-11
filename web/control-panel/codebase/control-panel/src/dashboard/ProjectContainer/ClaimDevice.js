import React, { Component } from 'react';
import Requests from '../../Requests.js'
import '../../fonts.css';
import {ClaimDeviceForm} from './ClaimDeviceForm.js';
import {Button, Row, Col, Card} from 'antd'

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
        <Row gutter={24}>
        {this.state.unclaimedDevices.map((device, i) =>
                <Col key={i} span={12}>
                    <Card title={"Device: " + device.hardwareId}  bordered={false} style={{marginTop: 20}}>
                      <ClaimDeviceForm device={device} activeProject={this.props.activeProject} token={this.props.token}> </ClaimDeviceForm>
                    </Card>
                </Col>
        )
      }
      </Row>
    )}
  }

  componentWillMount(){
      this.getUnclaimedDevices();
  }



  render() {
    return (
        <div style={{padding:"4%", paddingTop:"2%", paddingBottom:"2%"}}>
        {this.renderUnclaimed()}
        </div>
    );
  }
}
