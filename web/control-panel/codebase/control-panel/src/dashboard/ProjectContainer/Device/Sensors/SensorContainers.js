import React, { Component } from 'react';
import '../../../../fonts.css';
import {SensorForm} from './sensorForm.js'
import {AlertLog} from './AlertLog.js'
import { Collapse, Icon, Row, Col} from 'antd';
const Panel = Collapse.Panel;


export class SensorContainers extends React.Component {
  constructor(props, context) {
    super(props, context);
  }


  renderPanels(){
    if(this.props.sensors.length > 0){
      return (
      this.props.sensors.map((sensor_i, i) =>

      <Panel header={<Row type="flex" justify="space-around" align="top">
                      <Col span={10} style={{paddingTop:3}}>
                        <Icon type="share-alt" style={{marginRight: 10}}/>
                        {sensor_i.displayName} 
                      </Col>
                      <Col span={4}/>
                      <Col span={10}>
                        <AlertLog id="sensor{i}" sensor={sensor_i}/>
                      </Col>
                    </Row>
                    }>
            <SensorForm sensor = {sensor_i}/>
      </Panel>

      ))
    }
  }


  render() {
    return (
          <div style={{paddingLeft:10, paddingRight:10, marginBottom:"2%"}}>
          <Collapse  accordion>
            {this.renderPanels()}
          </Collapse>
          </div>


    );
  }
}