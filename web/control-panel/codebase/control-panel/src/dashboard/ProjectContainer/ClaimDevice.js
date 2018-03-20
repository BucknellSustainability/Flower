import React, { Component } from 'react';
import '../../fonts.css';
import {ClaimDeviceForm} from './ClaimDeviceForm.js';
import {Button, ButtonGroup, Modal, Row, Col, Form, FormGroup, FormControl ,ControlLabel, FormLabel, HelpBlock} from 'react-bootstrap';

export class ClaimDevice extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.handleHide = this.handleHide.bind(this);

    this.state = {
      show: false,
      unclaimedDevices: []
    };
  }

  handleHide() {
    this.setState({ show: false });
  }

  getUnclaimedDevices(){
      var xhr = new XMLHttpRequest();
      var url = 'http://linuxremote1.bucknell.edu:5001/read?table=device&fields=*&condition_fields=projectId&condition_values=null';
      xhr.open('GET', url);
      xhr.withCredentials = true;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      const scope = this;
      xhr.onload = function() {
        scope.setState({unclaimedDevices: xhr.response, show: true});
      };
      xhr.send();
      //this.setState({show: true})
  }


  render() {
    return (
      <div className="modal-container">
        <button className="ui-btn raise code-btn center-text concert"
          onClick={() => {this.getUnclaimedDevices()}}
          style={{marginLeft:15 , marginRight:10, marginTop:3}}
        >
          Claim Device
          <span className="glyphicon glyphicon-plus" aria-hidden="true" style={{marginLeft:5}}></span>
        </button>

        <Modal
          show={this.state.show}
          bsSize="large"
          onHide={this.handleHide}
          container={this}
          aria-labelledby="contained-modal-title">

          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title" className="concert bold"> <h2 className="concert bold" id="claim-modal-title"> Claim New Devices </h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              {this.state.unclaimedDevices.map((device, i) =>
                <Col key={i} xl={6} lg={6} md={6} sm={12} xs={12}>
                  <div className="card text-center card-inverse unclaimed-device">
                      <ClaimDeviceForm device={device} activeProject={this.props.activeProject} token={this.props.token}> </ClaimDeviceForm>
                  </div>
                </Col>
              )}
            </Row>


          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button bsStyle="danger" onClick={this.handleHide}>Cancel</Button>
              <Button bsStyle="success" onClick={this.handleHide}>Create</Button>
            </ButtonGroup>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
