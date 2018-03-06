import React, { Component } from 'react';
import './UploadCode.css';
import '../../../fonts.css';
import {Button, ButtonGroup, Modal, FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap'


function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <FormControl {...props} />
      {help && <HelpBlock id="uploadHelp">{help}</HelpBlock>}
    </FormGroup>
  );
}

export class UploadCode extends React.Component {

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
        <Button className="code-btn center-text concert"
          bsStyle="info"
          onClick={() => this.setState({ show: true })}
        >
          Upload Code
        </Button>

        <Modal
          show={this.state.show}
          onHide={this.handleHide}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title"> Upload Code Modal
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <form>
              <FieldGroup
                id="formControlsFile"
                type="file"
                label="Upload Arduino Code"
                help="Please Submit a File to Upload." 
              />
            </form>

          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button bsStyle="danger" onClick={this.handleHide}>Clear Device Code</Button>
              <Button bsStyle="success" onClick={this.handleHide}>Submit Code</Button>
            </ButtonGroup>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}