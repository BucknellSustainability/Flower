import React, { Component } from 'react';
import '../../fonts.css'
import './CreateVis.css'
import Requests from '../../Requests.js'
import {Button, ButtonGroup, Modal, Row, Col, SplitButton, MenuItem, Badge, Well, ButtonToolbar, ToggleButton, ToggleButtonGroup, Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap'

export class CreateVis extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.chartUrl = Requests.getChartURL();

    this.handleHide = this.handleHide.bind(this);
    this.showModal = this.showModal.bind(this);
    this.sensorToggleClick = this.sensorToggleClick.bind(this);
    this.handleChartTypeChange = this.handleChartTypeChange.bind(this);

    this.getAllProjects = Requests.getAllProjects.bind(this);

    this.newMin = this.newMin.bind(this);
    this.newMax = this.newMax.bind(this);

    this.state = {
      show: false,
      allProjects: [],
      activeProject: {sensors:[], name: ""},
      selectedSensors: [],
      chartType: 0,

      gaugeMin: 0,
      gaugeMax: 100
    };
  }

  getToggleType(){
    if(this.state.chartType === 1) return 'radio'
    else return 'checkbox'
  }

  newMin(e){
    this.setState({gaugeMin: e.target.value});
  }

  newMax(e){
    this.setState({gaugeMax: e.target.value});
  }

  handleHide() {
    this.setState({ show: false});
  }

  getIframeURL(){
    let out; 
    let sensors = JSON.stringify(this.state.selectedSensors).slice(1,-1) 
    if(this.state.chartType === 0){
      out = this.chartUrl + "visualize.html?id=" + sensors + '&projectId=' + this.state.activeProject.id;
    }
    if(this.state.chartType === 1){
      out = this.chartUrl + "gauge.html?max=" + this.state.gaugeMax + "&min=" + this.state.gaugeMin + "&id=" + sensors
    }
    return out;
  }

  getParamInputs(){
    //if gauge chart
    if(this.state.chartType === 1){
      return   (<Form style={{ marginBottom: 20}} inline>
                  <FormGroup controlId="formInlineName">
                    <ControlLabel>Name</ControlLabel>{' '}
                    <FormControl type="number" 
                                 max={this.state.gaugeMax - 1}
                                 placeholder="Enter Min Val"
                                 onChange={this.newMin} />
                  </FormGroup>{' '}
                  <FormGroup controlId="formInlineEmail">
                    <ControlLabel>Email</ControlLabel>{' '}
                    <FormControl type="number" 
                                 min={this.state.gaugeMin + 1}
                                 placeholder="Enter Max Val" 
                                 onChange={this.newMax}/>
                  </FormGroup>{' '}
                </Form>);
    }
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
      if(this.getToggleType() === "radio"){
        sensors = []
      }
      sensors.push(selectedId);
      this.setState({selectedSensors: sensors});
    }
  }

  handleChartTypeChange(e) {
    this.setState({ chartType: e , selectedSensors: []});
  }

  componentWillMount(){
      this.getAllProjects();
  }

  showModal(){
      let proj = this.getActiveProject(this.state.allProjects);
      let sensors = this.getInitialSensors(proj);
      this.setState({show: true, activeProject: proj, selectedSensors: sensors, chartType: 0});
  }

  getInitialSensors(activeProject){
      let i; let ids = [];
      for (i in activeProject.sensors){
        ids.push(activeProject.sensors[i].id);
      }
      return ids;
  }

  getActiveProject(xhrProjects){
    let i;
    for (i in xhrProjects){
      if (xhrProjects[i].id === this.props.activeProject.id ){
        return xhrProjects[i];
      }
    }
    return;
  }

  render() {
    return (
      <div className="modal-container">
        <button className="ui-btn raise code-btn center-text concert"
          onClick={this.showModal}
          style={{marginTop:3}}
        >
          Generate Graph
          <span className="glyphicon glyphicon-random" aria-hidden="true" style={{marginLeft:5}}></span>
        </button>

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
              <Col lg={4} md={4} sm={4}>

                <Well>
                  <p className="concert bold black text-left"> 1) Select Chart Type </p>
                  <ToggleButtonGroup 
                    name="chartRadio"
                    type='radio'
                    value={this.state.chartType} 
                    onChange={this.handleChartTypeChange}
                    style={{marginBottom: "20px"}}>
                    <ToggleButton name="line" bsStyle="info" value={0}>Line Graph</ToggleButton>
                    <ToggleButton name="gauge" bsStyle="info" value={1}>Gauge Chart</ToggleButton>
                  </ToggleButtonGroup>

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
                    <ToggleButtonGroup name="sensorSelect" type={this.getToggleType()} value={this.state.selectedSensors} vertical block>
                       {this.state.activeProject.sensors.map((sensor, i) =>
                              <ToggleButton 
                                className="sensor-check"
                                value={sensor.id} 
                                onChange={() => {this.sensorToggleClick(sensor.id)}}
                                style={{marginBottom: "5px", padding: "10px"}}> 
                                    <p className="concert bold"><Badge>{sensor.id}</Badge> {sensor.name}</p> 
                                    <p className="concert "> {sensor.description} </p>
                              </ToggleButton>
                        )}
                      </ToggleButtonGroup>
                    </ButtonToolbar>
                </Well>

              </Col>
              <Col lg={8} md={8} sm={8}>
                {this.getParamInputs()}

                <iframe width="570" height="450" src={this.getIframeURL()}></iframe>
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
