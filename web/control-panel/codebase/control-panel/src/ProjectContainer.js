import React, { Component } from 'react';
import './DeviceContainer.css';
import {DeviceNav} from './DeviceNav.js'
import {DeviceContainer} from './DeviceContainer.js'
import Button from 'react-bootstrap/lib/Button';
import Panel from 'react-bootstrap/lib/Panel';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Checkbox from 'react-bootstrap/lib/Checkbox'

import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'

export class ProjectContainer extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.deviceNavHandler = this.deviceNavHandler.bind(this);

    this.state = {
      index: 0,
      direction: null,
      activeDevice: 0
    };

  }

    deviceNavHandler(active){
    this.setState({
      activeDevice: active
    })
  }

  render() {
    const { index, direction } = this.state;
    const currProject = this.props.user.projects[this.props.activeProject];
    return (
        <div>
        <Panel bsStyle="primary">
          <Panel.Heading>
            <Panel.Title componentClass="h3">{currProject.name}</Panel.Title>
          </Panel.Heading>

          <Panel.Body>

            <Row>
              <Col md={9}>
                    <Form horizontal>
                      <FormGroup controlId="projectName">
                          <Col componentClass={ControlLabel} md={3}> Project Name </Col>
                          <Col md={8}> <FormControl type="text" placeholder={currProject.name} /> </Col>
                      </FormGroup>

                      <FormGroup controlId="adminEmail">
                          <Col componentClass={ControlLabel} md={3}> Admin Email </Col>
                          <Col md={8}> <FormControl type="text" placeholder={currProject.email} /> </Col>
                      </FormGroup>

                      <FormGroup controlId="projectDescription">
                          <Col componentClass={ControlLabel} md={3}> Project Description </Col>
                          <Col componentClass="textarea" md={7}></Col>
                      </FormGroup>

                      <Button type="submit">Submit</Button>
                    </Form>
              </Col>
              <Col md={3}>
                  <DeviceNav devices={currProject.devices} handler={this.deviceNavHandler}></DeviceNav>
              </Col>
            </Row>
          </Panel.Body>
        </Panel>
        <DeviceContainer device={currProject.devices[this.state.activeDevice]}/>
        </div>
    );
  }
}
