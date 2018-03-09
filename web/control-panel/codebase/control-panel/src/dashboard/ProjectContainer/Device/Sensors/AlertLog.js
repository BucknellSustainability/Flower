import React, { Component } from 'react';
import './AlertLog.css'
import '../../../../fonts.css';
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

  handleAlert() {
    var form_data = new FormData();

    let pairs = 'handled=2';
    let cond = ' deviceId='+ this.props.device.deviceId + ' ';

    form_data.append('id_token', this.props.token);
    form_data.append('table', 'alerts')
    form_data.append('modify_pairs', pairs)
    form_data.append('condition', cond)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/update');
    xhr.withCredentials = true;

    xhr.onload = function() {
        //window.location.reload();
    };
    xhr.send(form_data);
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

  addHandledBtn(handled) {
    if (handled == 1){
      return <td className="text-center"><Button>Mark Handled</Button></td>
    }
    return <td className="text-center"></td>
  }

  showModal(){
      this.setState({show: true});
  }

  componentWillMount(){
  }

  getAlerts(){
    var xhr = new XMLHttpRequest();
    var url = 'http://127.0.0.1:5000/read?table=alerts&fields=alertId,handled,alertTime&condition=sensorId=' + this.props.sensor.id;
    xhr.open('GET', url);
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    const scope = this;
    xhr.onload = function() {
        scope.setState({alertData: xhr.response, show:true});
    };
    xhr.send();
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