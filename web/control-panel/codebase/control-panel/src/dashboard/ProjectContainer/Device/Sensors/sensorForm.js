import React, { Component } from 'react';
import Requests from '../../../../Requests.js'
import {Card, Divider, Row, Col, Form, Input, Tooltip, Icon, Select, Radio} from 'antd'
const { TextArea } = Input
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
};

export class SensorForm extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.updateSensor = Requests.updateSensor.bind(this)

    this.state = {
      name: this.props.sensor.name,
      id: this.props.sensor.id,
      units: "degree F", //TODO: need to figure out data lifecycle
      limHigh: 100,
      limLow: 0,
      maxLength: 20
    };
  }

  ComponentWillMount() {
    //update any changes to sensor info
  }

  render() {
    const currSensor = this.props.sensor;
    return (
            <Row type="flex" justify="space-around" align="top">
                <Col span={24} style={{marginBottom:0}}>
                  <FormItem {...formItemLayout} label={(<span>Sensor Name&nbsp;
                                <Tooltip title="">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                      <Input placeholder={currSensor.displayName} />
                  </FormItem>

                  <FormItem {...formItemLayout} label={(<span>Description&nbsp;
                                <Tooltip title="Give a little more information about your sensor">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                      <Input placeholder={currSensor.desc} />
                  </FormItem>

                  <FormItem {...formItemLayout} label={(<span>Alerts Enabled&nbsp;
                                <Tooltip title="If public your project will appear on the public landing page.">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                              <Select value={currSensor.alerts_enabled}>
                                <Option value={1}>True</Option>
                                <Option value={0}>False</Option>
                              </Select>
                  </FormItem>

                  <FormItem {...formItemLayout} label={(<span>Public Page Url&nbsp;
                                <Tooltip title="Specify website url with your projects information. (Usually will be a wordpress page)">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                      <Input placeholder="" />
                  </FormItem>

                  <FormItem {...formItemLayout} label={(<span>Site Selection&nbsp;
                                <Tooltip title="Select a site with your project.">
                                  <Icon type="question-circle-o" />
                                </Tooltip>
                              </span>)}>
                    <Select style={{width:200, float:"left"}} defaultValue="greenhouse">
                      <Option value="greenhouse">Greenhouse</Option>
                      <Option value="array">Solar Arrays</Option>
                      <Option value="tower">Water Tower</Option>
                    </Select>
                  </FormItem>

                </Col> 
            </Row>
    );}
  }
