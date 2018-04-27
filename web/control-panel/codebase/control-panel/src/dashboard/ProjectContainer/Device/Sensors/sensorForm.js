import React, { Component } from 'react';
import Requests from '../../../../Requests.js'
import {Card, Divider, Row, Col, Form, Input, Tooltip, Icon, Select, Radio, Button} from 'antd'
const { TextArea } = Input
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const formItemLayout = {
      labelCol: {
        xs: { span: 10 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 16 },
      },
};

export class SensorForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.updateSensor = Requests.updateSensor.bind(this)

    this.state = {
      name: this.props.sensor.displayName,
      id: this.props.sensor.id,
      units: this.props.sensor.units, //TODO: need to figure out data lifecycle
      min: this.props.sensor.min,
      max: this.props.sensor.max,
      alerts: this.props.sensor.alerts_enabled,
      min_msg: this.props.sensor.min_msg,
      max_msg: this.props.sensor.max_msg
    };
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.sensor.id !== this.props.sensor.id){
      this.setState({
        name: this.props.sensor.displayName,
        id: this.props.sensor.id,
        units: this.props.sensor.units, //TODO: need to figure out data lifecycle
        min: this.props.sensor.min,
        max: this.props.sensor.max,
        alerts: this.props.sensor.alerts_enabled,
        min_msg: this.props.sensor.min_msg,
        max_msg: this.props.sensor.max_msg
      })
    }
  }

  handleAlertChange(value){
    this.setState({alerts: value})
  }

  onSubmit(){
    this.updateSensor();
  }

  ComponentWillMount() {
    //update any changes to sensor info
  }

  ifAlertEnabled(currSensor){
    if(this.state.alerts === 1){
      return(
                <div>
                  <FormItem {...formItemLayout} label={(<span>Min Value&nbsp;
                                <Tooltip title="Min Threshold for Alerts">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                      <Input placeholder={currSensor.min} onChange={(e) => this.setState({min: e.target.value})}/>
                  </FormItem>

                  <FormItem {...formItemLayout} label={(<span>Max Value&nbsp;
                                <Tooltip title="Max Thresshold for Alerts">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                      <Input placeholder={currSensor.max} onChange={(e) => this.setState({max: e.target.value})}/>
                  </FormItem>

                  <FormItem {...formItemLayout} label={(<span>Min Message&nbsp;
                                <Tooltip title="Message for Email Alert on Min Threshold">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                      <Input placeholder={currSensor.min_msg} onChange={(e) => this.setState({min_msg: e.target.value})}/>
                  </FormItem>

                  <FormItem {...formItemLayout} label={(<span>Max Value&nbsp;
                                <Tooltip title="Message for Email Alert on Min Threshold">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                      <Input placeholder={currSensor.max_msg} onChange={(e) => this.setState({max_msg: e.target.value})}/>
                  </FormItem>
                  </div>
      )
    }
  }

  render() {
    const currSensor = this.state;
    return (  
                <div>
                  <FormItem {...formItemLayout} label={(<span>Sensor Name&nbsp;
                                <Tooltip title="">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                      <Input placeholder={currSensor.name} onChange={(e) => this.setState({name: e.target.value})}/>
                  </FormItem>

                  <FormItem {...formItemLayout} label={(<span>Units&nbsp;
                                <Tooltip title="Indicate Units of Sensor">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                      <Input placeholder={currSensor.units} onChange={(e) => this.setState({units: e.target.value})}/>
                  </FormItem>

                  <FormItem {...formItemLayout} label={(<span>Alerts Enabled&nbsp;
                                <Tooltip title="Recieve Email Alerts for this Sensor?">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                              <Select style={{width:100}} value={currSensor.alerts} onChange={this.handleAlertChange.bind(this)}>
                                <Option value={1}>True</Option>
                                <Option value={0}>False</Option>
                              </Select>
                  </FormItem>

                  {this.ifAlertEnabled(currSensor)}

                <Button style={{marginLeft: "40%", marginTop: 15, marginBottom: 0}} icon="check-circle-o" onClick={this.updateSensor}>
                      Submit Info
                </Button>
              </div>
    );}
  }
