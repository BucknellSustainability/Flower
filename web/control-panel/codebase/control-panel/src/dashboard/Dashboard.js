import React, { Component } from 'react';
import './Dashboard.css';
import {ProjectNav} from './ProjectNav/ProjectNav.js'
import {ProjectContainer} from './ProjectContainer/ProjectContainer.js'
import {Row, Col} from 'react-bootstrap/lib/'


export class Dashboard extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.projectNavHandler = this.projectNavHandler.bind(this);

    this.state = {
      activeProject: 0,
      user:{
        name:"Jordan",
        projects:[
            {
              name:"Water Tank",
              email:"bob@bucknell.edu",
              alerts: false,
              devices: [{
                id: 1,
                name: "Arduino 1",
                sensors:[{
                  id: 1,
                  name: "Water Sensor"
                },{
                  id:2,
                  name: "Fire Sensor"
                },{
                  id:3,
                  name: "Wind Sensor"
                },{
                  id:4,
                  name:"Earth Sensor"
                }
              ]},
              {
                id: 2,
                name: "Arduino 2",
                sensors:[{
                  id: 5,
                  name: "sensor"}
                ]}
              ]}
            ,
            {
            name:"Solar Array",
            email:"ugh@bucknell.edu",
            alerts: true,
            devices: [{
              id: 2,
              name: "Device 1",
              sensors:[{
                id: 6,
                name: "Tree sensor"
              }]
            }]
        },
        {
            name:"Wind Turbine",
            email:"ugh@bucknell.edu",
            alerts: true,
            devices: [{
              id: 2,
              name: "Device 1",
              sensors:[{
                id: 6,
                name: "Tree sensor"
              }]
            }]
        }]
      }
    };
  }

  projectNavHandler(active) {
    this.setState({
      activeProject: active
    })
  }

  render() {
  	const projectNav = <ProjectNav user={this.state.user} handler={this.projectNavHandler}/>;
    const projectContainer = <ProjectContainer user={this.state.user} activeProject={this.state.activeProject}/>

    return (	
        <div className="dashboard-main">
            <Row>
              <Col id="navCol" md={3}>
                  {projectNav} 
              </Col>
              <Col id="projCol" md={9}>
                  {projectContainer}
              </Col>
            </Row>
        </div>
    );
  }

}