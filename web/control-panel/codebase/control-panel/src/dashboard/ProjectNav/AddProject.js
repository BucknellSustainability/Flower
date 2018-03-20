import React, { Component } from 'react';
import '../../fonts.css'
import {Button, ButtonGroup, Modal, Row, Col, SplitButton, MenuItem, Badge, Well, ButtonToolbar, ToggleButton, ToggleButtonGroup, Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap'

export class AddProject extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.showModal = this.showModal.bind(this)
    this.handleHide = this.handleHide.bind(this)

    this.state = {
      show:false
    };
  }

  handleHide() {
    this.setState({ show: false});
  }
 


  showModal(){
      this.setState({show: true});
  }



  render() {
    return (
      <div className="modal-container">
        <button className="ui-btn raise code-btn center-text concert"
          onClick={this.showModal}
          style={{marginBottom:10}}
        >
          <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
        </button>

        <Modal 
          show={this.state.show}
          bsSize="large"
          onHide={this.handleHide}
          container={this}
          aria-labelledby="contained-modal-title" 
          >

          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title"> Add Project
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Row>
              <Col lg={5} md={5} sm={5} lgOffset={1} mdOffset={1} smOffset={1}>
                <div className="card box-shadow create-proj-card">
                  <div className="card-header">
                    <h4 className="my-0 font-weight-normal">Create Project</h4>
                  </div>
                  <div className="card-body">
                    <button type="button" className="btn btn-lg btn-block btn-primary">Get started</button>
                  </div>
                </div>

                </Col>
                <Col lg={5} md={5} sm={5}>
                  <div className="card border border-black box-shadow">
                    <div className="card-header">
                      <h4 className="font-weight-normal">Join Existing Project</h4>
                    </div>
                    <div className="card-body create-proj-card">
                      <button type="button" className="btn btn-lg btn-block btn-primary">Request Access</button>
                    </div>
                  </div>
              </Col>
            </Row>


          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button bsStyle="danger" onClick={this.handleHide}>Cancel</Button>
              <Button bsStyle="success" onClick={this.handleHide}>Copy Link</Button>
            </ButtonGroup>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
