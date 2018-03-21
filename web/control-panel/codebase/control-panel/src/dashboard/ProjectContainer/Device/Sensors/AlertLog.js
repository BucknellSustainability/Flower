import React, { Component } from 'react';
import Requests from '../../../../Requests.js'
import './AlertLog.css'
import '../../../../fonts.css';
import {ButtonGroup, Button, Modal} from 'react-bootstrap'

export class AlertLog extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.handleHide = this.handleHide.bind(this);
    this.getAlerts = Requests.getAlerts.bind(this);
    this.handleAlert = Requests.handleAlerts.bind(this)

    this.state = {
      show: false,
      alertData: []
    };
  }

  handleHide() {
    this.setState({ show: false });
  }

  getHandledText(handled) {
    if(handled == 1){
      return <td className="text-center false-handled bold"> False </td>;
    }
    else{
      return <td className="text-center true-handled"> True </td>;
    }
  }

  showModal(){
      this.setState({show: true});
  }

  componentWillMount(){
  }

  render() {
    return (
      <div className="modal-container">
        <button bsSize="small" className="ui-btn raise concert" onClick={() => {this.getAlerts()}}>Alert Log</button>

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
                  <th className="text-center">Alert #</th>
                  <th className="text-center">Alert Id</th>
                  <th className="text-center">Alert Time</th>
                  <th className="text-center">Handled?</th>
                </tr>
              </thead>
              <tbody>

              {this.state.alertData.map((alert, i) =>
                <tr> 
                    <td className="text-center">{i}</td>
                    <td className="text-center">{alert.alertId}</td>
                    <td className="text-center">{alert.alertTime}</td>
                    {this.getHandledText(alert.handled)}
                </tr>
              )}

              </tbody>
            </table>


          </Modal.Body>
          <Modal.Footer>
            <ButtonGroup>
              <Button bsStyle="success" onClick={this.handleAlert}>Mark Alerts Handled</Button>
              <Button bsStyle="danger" onClick={this.handleHide}>Exit</Button>
            </ButtonGroup>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
