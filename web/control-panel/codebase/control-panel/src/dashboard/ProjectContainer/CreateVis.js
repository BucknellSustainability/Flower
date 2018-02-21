import React, { Component } from 'react';
import {Button, ButtonGroup, Modal} from 'react-bootstrap'

export class CreateVis extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.handleHide = this.handleHide.bind(this);
    this.state = {
      show: false
    };
  }

  handleHide() {
    this.setState({ show: false });
  }

  render() {
    return (
      <div className="modal-container">
        <Button className="code-btn center-text"
          bsStyle="info"
          onClick={() => this.setState({ show: true })}
        >
          Generate Graph
        </Button>

        <Modal
          show={this.state.show}
          bsSize="large"
          onHide={this.handleHide}
          container={this}
          aria-labelledby="contained-modal-title" 
          >

          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title"> Generate Visualization Graph
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>

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