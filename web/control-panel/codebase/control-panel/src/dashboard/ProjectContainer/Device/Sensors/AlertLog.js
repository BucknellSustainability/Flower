import React, { Component } from 'react';
import './AlertLog.css'
import {ButtonGroup, Button, Modal} from 'react-bootstrap'

export class AlertLog extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.handleHide = this.handleHide.bind(this);
    this.getAlerts = this.getAlerts.bind(this);
    this.state = {
      show: false,
      alertData: []
    };
  }

  handleHide() {
    this.setState({ show: false });
  }

  addHandledBtn(handled) {
    if (handled == 1){
      return <td><Button>Mark Handled</Button></td>
    }
    return <td></td>
  }

  getAlerts(){
    var xhr = new XMLHttpRequest();
    var url = 'http://127.0.0.1:5000/read?table=alerts&fields=alertId,handled&condition=sensorId=' + this.props.sensor.id;
    xhr.open('GET', url);
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    const scope = this;
    xhr.onload = function() {
        scope.setState({alertData: xhr.response, show: true});
    };
    xhr.send();
    this.setState({show: true})
  }

  render() {
    return (
      <div className="modal-container">
        <Button bsSize="small" className="alert-log-btn" onClick={() => {this.getAlerts()}}>Alert Log</Button>

        <Modal
          bsSize="large"
          show={this.state.show}
          onHide={this.handleHide}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title"> Alert Log: {this.props.sensor.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>


            <table class="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Alert #</th>
                  <th scope="col">AlertId</th>
                  <th scope="col">Handled</th>
                </tr>
              </thead>
              <tbody>

              {this.state.alertData.map((alert, i) =>
                <tr>
                    <th scope="row">{i}</th>
                    <td>{alert.alertId}</td>
                    <td>{alert.handled}</td>
                    {this.addHandledBtn(alert.handled)}
                </tr>
              )}

              </tbody>
            </table>


          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button bsStyle="danger" onClick={this.handleHide}>Exit</Button>
            </ButtonGroup>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}