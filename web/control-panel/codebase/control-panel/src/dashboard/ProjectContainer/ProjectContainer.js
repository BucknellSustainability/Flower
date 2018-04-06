import React, { Component } from 'react';
import {DeviceContainer} from './Device/DeviceContainer.js'
import {CreateVis} from './CreateVis.js';
import {ClaimDevice} from './ClaimDevice.js';
import {Card, Divider, Row, Col, Form, Input, Tooltip, Icon, Select, Radio, Layout, Menu} from 'antd'
const { TextArea } = Input
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Header, Footer, Sider, Content } = Layout;


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

export class ProjectContainer extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      showVis: false,
      showClaimDevice: false,
      projectMode: "control"
    };
  }

  componentWillMount(){
    //going to need to load all of the sites and get names
  }

  handleMenuClick(e){
    this.setState({projectMode: e.key})
  }

  getContent(currProject){
    if(this.state.projectMode === "control"){
      return (
                  <div style={{marginTop:25}}>
                    <Row type="flex" justify="space-around" align="top">
                        <Col span={11} style={{marginBottom:0}}>
                          <FormItem {...formItemLayout} label={(<span>Project Name&nbsp;
                                        <Tooltip title="Add a relevant name to demonstrate your project's goals. Press Enter to Submit">
                                          <Icon type="question-circle-o" />
                                        </Tooltip>
                                      </span>)}>
                              <Input placeholder={currProject.name} />
                          </FormItem>

                          <FormItem {...formItemLayout} label={(<span>Description&nbsp;
                                        <Tooltip title="Give a little more information about your project">
                                          <Icon type="question-circle-o" />
                                        </Tooltip>
                                      </span>)}>
                              <TextArea rows={4} placeholder={currProject.desc}/>
                          </FormItem>
                        </Col>

                        <Col span={11} style={{marginTop:0}}>
                          <FormItem {...formItemLayout} label={(<span>Project Scope&nbsp;
                                        <Tooltip title="If public your project will appear on the public landing page.">
                                          <Icon type="question-circle-o" />
                                        </Tooltip>
                                      </span>)}>
                                    <RadioGroup defaultValue={currProject.is_private}>
                                      <RadioButton value={0}>Public</RadioButton>
                                      <RadioButton value={1}>Private</RadioButton>
                                    </RadioGroup>
                          </FormItem>

                          <FormItem {...formItemLayout} label={(<span>Public Page Url&nbsp;
                                        <Tooltip title="Specify website url with your projects information. (Usually will be a wordpress page)">
                                          <Icon type="question-circle-o" />
                                        </Tooltip>
                                      </span>)}>
                              <Input placeholder={currProject.url} />
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
                    <Divider />
                    <DeviceContainer device={currProject.devices[this.props.activeDevice]} devices={currProject.devices} handler={this.props.handler} deleteDevice={this.props.deleteDevice}/>
                    </div>
        )
    } else if (this.state.projectMode ==="create") {
      return (
         <CreateVis activeProject={currProject}/>
        )
    } else {
      return (
          <ClaimDevice activeProject={currProject} token={this.props.token}/>
        )
    }
  }


  render() {
    const currProject = this.props.user.projects[this.props.activeProject];
    if(currProject !== undefined){
      
      return (


            <Layout theme="dark">
              <Header>

                          <Row type="flex" justify="space-around" align="top">
                              <span className="ubuntu white"> {"Project Information: " + currProject.name}</span>
                            <Menu
                              theme="dark"
                              mode="horizontal"
                              defaultSelectedKeys={['control']}
                              style={{ lineHeight: '64px' }}
                              onClick={this.handleMenuClick.bind(this)}
                            >
                              <Menu.Item key="control">Project Control</Menu.Item>
                              <Menu.Item key="create">Generate Visualization</Menu.Item>
                              <Menu.Item key="claim">Claim New Device</Menu.Item>
                            </Menu>
                          </Row>
              </Header>
              <Content>
                {this.getContent(currProject)}
              </Content>
            </Layout>


      );
    } else{
      return (
            <Card title={<span><Icon type="frown-o"/> No Projects </span>}>
              Create or Join a Project to see Information
            </Card>

      )


    }
  }
}
