import React, { Component } from 'react';
import logo from './logo.svg';
import './Dashboard.css';
import {ProjectContainer} from './ProjectContainer.js'
import {SensorContainer} from './SensorContainer.js'


export class Dashboard extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
    	user: "Jordan"
    };
  }

  render() {
  	const projects = <ProjectContainer user={this.state.user} projectId={1}/>;
    return (	
        <div className="row">
            <div className="col-md-2 "> {projects} </div>
            <div className="col-md-10">  <SensorContainer projectId={projects.props.projectId}/> </div>
        </div>
    );
  }

}