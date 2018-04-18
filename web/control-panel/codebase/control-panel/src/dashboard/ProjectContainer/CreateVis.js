import React, { Component } from 'react';
import '../../fonts.css'
import '../../App.css'
import Requests from '../../Requests.js'
import {Button, Menu, Row, Col, Select, Radio} from 'antd'
import {Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap'

const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const radioStyle = {
      display: 'block',
      height: '35px',
      marginBottom: "10px"
    };


export class CreateVis extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.chartUrl = Requests.getChartURL();
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

  componentWillMount(){
      this.getAllProjects();
  }


  getToggleType(){
    if(this.state.chartType === 1) return (this.getRadioButtons())
    else return (this.getCheckButtons())
  }

  getRadioButtons(){
    return (
          <RadioGroup onChange={this.sensorRadioChange.bind(this)} style={{width: "70%"}}>
             {this.state.activeProject.sensors.map((sensor, i) =>
                    <RadioButton
                      value={sensor.id} 
                      style={radioStyle}> 
                          {sensor.displayName}
                    </RadioButton>
              )}
          </RadioGroup>
      )
  }

  sensorRadioChange(e){
    this.setState({selectedSensors: [e.target.value]});
  }

  getCheckButtons(){
    return (
      <div>
      {this.state.activeProject.sensors.map((sensor, i) =>
        <RadioGroup value={(this.findElement(sensor.id) !== -1) ? 1:0} style={{width: "70%"}}>
                  <RadioButton
                    value={1}
                    id={sensor.id}
                    onClick={this.sensorCheckChange.bind(this)}
                    style={radioStyle}> 
                        {sensor.displayName}
                  </RadioButton>
        </RadioGroup>
      )}
      </div>
    )
  }

  sensorCheckChange(e){
    let id = parseInt(e.target.id);
    let found = this.findElement(id);
    let sensors = this.state.selectedSensors;
    if(found !== -1){ //if selected
      sensors.splice(found, 1);
      this.setState({selectedSensors: sensors});
    }
    else{
      sensors.push(id)
      this.setState({selectedSensors: sensors})
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

  newMin(e){
    this.setState({gaugeMin: e.target.value});
  }

  newMax(e){
    this.setState({gaugeMax: e.target.value});
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
                    <ControlLabel>Min: </ControlLabel>{' '}
                    <FormControl type="number" 
                                 max={this.state.gaugeMax - 1}
                                 placeholder="Enter Min Val"
                                 onChange={this.newMin} />
                  </FormGroup>{' '}
                  <FormGroup controlId="formInlineEmail">
                    <ControlLabel>Max: </ControlLabel>{' '}
                    <FormControl type="number" 
                                 min={this.state.gaugeMin + 1}
                                 placeholder="Enter Max Val" 
                                 onChange={this.newMax}/>
                  </FormGroup>{' '}
                </Form>);
    }
  }

  handleChartTypeChange(e) {
    this.setState({ chartType: e.target.value , selectedSensors: []});
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

  handleProjectChange(value) {
    let projs = this.state.allProjects;
    let active = {sensors:[], name: ""}
    let i;
    for (i in projs){
      if (projs[i].id == value){
        this.setState({activeProject: projs[i]}) 
      }
    }
  }

  render() {
    return (
      <div style={{padding:"2%", textAlign:"center"}}>
            <Row>
              <Col span={8}>
                  <p className="concert bold black text-left" style={{marginLeft:25}}> 1) Select Chart Type </p>

                  <RadioGroup onChange={this.handleChartTypeChange} defaultValue={this.state.chartType} style={{marginBottom:20, width:"80%"}}>
                    <RadioButton value={0}>Line Graph</RadioButton>
                    <RadioButton value={1}>Gauge Chart</RadioButton>
                  </RadioGroup>

                  <p className="concert bold black text-left" style={{marginLeft:25}}> 2) Select Project(s) </p>

                  <Select onChange={this.handleProjectChange.bind(this)} value={this.state.activeProject.id} style={{ width: "70%", marginBottom: 20 }} onChange={this.handleProjectChange.bind(this)}>
                    {this.state.allProjects.map((project, i) =>
                      <Option value={project.id}>{project.name}</Option>
                    )}
                  </Select>


                  <p className="concert bold black text-left" style={{marginLeft:25}}> 3) Select Sensors </p>
                  {this.getToggleType()}

              </Col>
              <Col span={16}>
                {this.getParamInputs()}
                <iframe width="700" height="410" src={this.getIframeURL()}></iframe>
                <h6 className="black"> iframe link: [iframe width=100% height=400px src={this.getIframeURL()} scrolling="no"] </h6>
              </Col>
            </Row>
      </div>
    );
  }
}
