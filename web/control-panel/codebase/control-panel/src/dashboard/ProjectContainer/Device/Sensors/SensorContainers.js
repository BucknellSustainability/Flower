import React, { Component } from 'react';
import '../../../../fonts.css';
import {SensorForm} from './sensorForm.js'
import {AlertLog} from './AlertLog.js'
import {Button, Panel, PanelGroup, Row, Col} from 'react-bootstrap'


export class SensorContainers extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      index: 0,
      direction: null,
    };
  }

  handleSelect(activeKey) {
    this.setState({ index: activeKey });
  }


  render() {
    const { index, direction } = this.state;

    return (

          <PanelGroup
            accordion
            id="accordion-controlled-example"
            activeKey={this.state.activeKey}
            onSelect={this.handleSelect}
          >

            {this.props.sensors.map((sensor_i, i) =>
              <Panel className="sensor-container" eventKey={i} id={i} bsStyle="info">
                <Panel.Heading className="sensor-container-header">
                  <Row>
                    <Col lg={6} md={6} sm={6} lgOffset={3} mdOffset={3} smOffset={3}>
                          <Panel.Title className="sensor-container-title concert" componentClass="h4" toggle>
                            {sensor_i.name}
                            <span className="glyphicon glyphicon-chevron-down" aria-hidden="false" style={{marginLeft:5}}></span>
                          </Panel.Title>
                    </Col>
                    <Col lg={3} md={3} sm={3}>
                          <AlertLog id="sensor{i}" sensor={sensor_i}/>
                    </Col>
                  </Row>
                </Panel.Heading>
                <Panel.Body className="sensor-container-body" collapsible>
                  <SensorForm sensor = {sensor_i}/>
                </Panel.Body>
              </Panel>

          )}
          </PanelGroup>
    );
  }
}