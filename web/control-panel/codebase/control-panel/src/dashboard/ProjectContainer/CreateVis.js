import React, { Component } from 'react';
import '../../fonts.css'
import './CreateVis.css'
import {Button, ButtonGroup, Modal, Row, Col, SplitButton, MenuItem, Badge, Well, ButtonToolbar, ToggleButton, ToggleButtonGroup} from 'react-bootstrap'

export class CreateVis extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.handleHide = this.handleHide.bind(this);
    this.sensorToggleClick = this.sensorToggleClick.bind(this);

    this.state = {
      show: false,
      allProjects: [],
      activeProject: {sensors:[]},
      selectedSensors: []
    };
  }

  handleHide() {
    this.setState({ show: false });
  }

  getIframeURL(){
    let len = this.state.selectedSensors.length
    let out = "https://eg.bucknell.edu/~jav017/Flower/WebServer/visualize.html?id=" + JSON.stringify(this.state.selectedSensors).slice(1,-1)
    console.log(out)
    return out;
  }

  findElement(selectedId){
    let i;
      for (i in this.state.selectedSensors){
        if(selectedId === this.state.selectedSensors[i]){
          return i;
        }
      }
      return -1;
  }

  sensorToggleClick(selectedId){
    let sensors = this.state.selectedSensors;
    let found = this.findElement(selectedId)
    console.log(found)
    if(found !== -1){
      sensors.splice(found, 1)
      this.setState({selectedSensors: sensors});
    }
    else{
      sensors.push(selectedId);
      this.setState({selectedSensors: sensors});
    }
    console.log(sensors)
  }


  getAllProjects(){
      var xhr = new XMLHttpRequest();
      var url = 'http://127.0.0.1:5000/get-all-sensors';
      xhr.open('GET', url);
      xhr.withCredentials = true;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      const scope = this;
      xhr.onload = function() {
        scope.setState({allProjects: xhr.response.projects, activeProject: xhr.response.projects[0] ,show: true});
        console.log(xhr.response.projects);
      };
      xhr.send();
      //this.setState({show: true})
  }


  render() {
    console.log(this.state.selectedSensors)
    return (
      <div className="modal-container">
        <Button className="code-btn center-text concert"
          bsStyle="info"
          onClick={() => {this.getAllProjects()}}
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

            <Row>
              <Col lg={6} md={6} sm={6}>

                <Well>
                  <p className="concert bold black text-left"> 1) Select Chart Type </p>
                  <ButtonGroup style={{marginBottom: "20px"}}>
                    <Button bsStyle="info">Line Graph</Button>
                    <Button bsStyle="info">Gauge Chart</Button>
                    <Button bsStyle="info">Pie Chart</Button>
                  </ButtonGroup>

                  <p className="concert bold black text-left"> 2) Select Project(s) </p>
                  <SplitButton title={this.state.activeProject.name} pullRight id="split-button-pull-right" style={{marginBottom: "20px"}}>
                    {this.state.allProjects.map((project, i) =>
                        <MenuItem 
                          id={project.id} 
                          eventKey={i} 
                          onClick={() => {this.setState({activeProject: project})}}> {project.name} <Badge>{project.id}</Badge>
                        </MenuItem>
                    )}
                  </SplitButton>;


                  <p className="concert bold black text-left"> 3) Select Sensors </p>
                  <ButtonToolbar>
                    <ToggleButtonGroup type="checkbox" value={this.state.selectedSensors} vertical block>
                       {this.state.activeProject.sensors.map((sensor, i) =>
                              <ToggleButton 
                                className="sensor-check"
                                value={sensor.id} 
                                onChange={() => {this.sensorToggleClick(sensor.id)}}
                                style={{marginBottom: "5px", padding: "10px"}}> 
                                    <p className="concert bold"><Badge>{sensor.id}</Badge> {sensor.name}</p> 
                                    <p className="concert"> {sensor.description} </p>
                              </ToggleButton>
                        )}
                      </ToggleButtonGroup>
                    </ButtonToolbar>
                </Well>

              </Col>
              <Col lg={6} md={6} sm={6}>
                <iframe width="400" height="400" src={this.getIframeURL()}></iframe>
                <h6 className="black"> iframe link: [ iframe width="800" height="450" src={this.getIframeURL()} ] </h6>
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