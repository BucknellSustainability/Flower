import React, { Component } from 'react';
import './Dashboard.css';
import {ProjectNav} from './ProjectNav.js'
import {ProjectContainer} from './ProjectContainer.js'
import Well from 'react-bootstrap/lib/Well'

import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'

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
                name: "arduino 1",
                sensors:[{
                  id: 1,
                  name: "water"
                },{
                  id:2,
                  name: "fire"
                },{
                  id:3,
                  name: "wind"
                },{
                  id:4,
                  name:"earth"
                }
              ]},
              {
                id: 2,
                name: "arduino 2",
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
              name: "device 1",
              sensors:[{
                id: 6,
                name: "tree sensor"
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
        <div className="row">
            <Row>
              <Col id="navCol" md={2}>
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