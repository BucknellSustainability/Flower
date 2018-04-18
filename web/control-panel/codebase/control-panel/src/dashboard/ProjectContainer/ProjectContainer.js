import React, { Component } from 'react';
import {DeviceContainer} from './Device/DeviceContainer.js'
import {CreateVis} from './CreateVis.js';
import {ClaimDevice} from './ClaimDevice.js';
import {AddProject} from './AddProject.js';
import Requests from '../../Requests.js'
import {Card, Divider, Row, Col, Form, Input, Tooltip, Icon, Select, Radio, Layout, Menu, Button} from 'antd'
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


    let currProject = this.props.user.projects[this.props.activeProject];
    this.updateProject = Requests.updateProject.bind(this);

    this.state = {
      showVis: false,
      showClaimDevice: false,
      projectMode: "control",
      iconLoading: false,
      name: currProject.name,
      desc: currProject.desc,
      scope: currProject.is_private,
      url: currProject.url
    };
  }

  componentWillUpdate(){
    if(this.props.projectChanged === 1){
      let currProject = this.props.user.projects[this.props.activeProject];
      this.setState({ name: currProject.name,
                      desc: currProject.desc,
                      scope: currProject.is_private,
                      url: currProject.url})
      this.props.resetProjectChanged();
    }
  }

  componentWillMount(){
  }

  updateName(e){
    this.setState({name: e.target.value})
  }

  updateDesc(e){
    this.setState({desc: e.target.value})
  }

  updateScope(e){
    this.setState({scope: e.target.value})
  }

  updateScope(e){
    this.setState({scope: e.target.value})
  }

  updateUrl(e){
    this.setState({url: e.target.value})
  }

  updateProjectClick(){
    let projectId = this.props.user.projects[this.props.activeProject].id;
    this.updateProject(projectId);
  }

  handleMenuClick(e){
    this.setState({projectMode: e.key})
  }

  getContent(currProject){
    if(this.state.projectMode === "control"){
      return (
                  <div style={{marginTop:25}}>
                    <AddProject open={this.props.open} changeMode={this.props.changeMode}/>
                    <Row type="flex" justify="space-around" align="top">
                        <Col span={11} style={{marginBottom:0}}>
                          <FormItem {...formItemLayout} label={(<span>Project Name&nbsp;
                                        <Tooltip title="Add a relevant name to demonstrate your project's goals. Press Enter to Submit">
                                          <Icon type="question-circle-o" />
                                        </Tooltip>
                                      </span>)}>
                              <Input onChange={this.updateName.bind(this)} placeholder={currProject.name} />
                          </FormItem>

                          <FormItem {...formItemLayout} label={(<span>Description&nbsp;
                                        <Tooltip title="Give a little more information about your project">
                                          <Icon type="question-circle-o" />
                                        </Tooltip>
                                      </span>)}>
                              <TextArea rows={4} onChange={this.updateDesc.bind(this)} placeholder={currProject.desc}/>
                          </FormItem>
                        </Col>

                        <Col span={11} style={{marginTop:0}}>
                          <FormItem {...formItemLayout} label={(<span>Project Scope&nbsp;
                                        <Tooltip title="If public your project will appear on the public landing page.">
                                          <Icon type="question-circle-o" />
                                        </Tooltip>
                                      </span>)}>
                                    <RadioGroup onChange={this.updateScope.bind(this)} defaultValue={currProject.is_private}>
                                      <RadioButton value={0}>Public</RadioButton>
                                      <RadioButton value={1}>Private</RadioButton>
                                    </RadioGroup>
                          </FormItem>

                          <FormItem {...formItemLayout} label={(<span>Public Page Url&nbsp;
                                        <Tooltip title="Specify website url with your projects information. (Usually will be a wordpress page)">
                                          <Icon type="question-circle-o" />
                                        </Tooltip>
                                      </span>)}>
                              <Input onChange={this.updateUrl.bind(this)} onplaceholder={currProject.url} />
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
                          <Button style={{marginLeft: -60, marginTop: 30, marginBottom: 5}} icon="check-circle-o" loading={this.state.iconLoading} onClick={this.updateProjectClick.bind(this)}>
                            Submit Info
                          </Button>

                        </Col> 
                    </Row>
                    <Divider />
                    <DeviceContainer device={currProject.devices[this.props.activeDevice]} devices={currProject.devices} handler={this.props.handler} deleteDevice={this.props.deleteDevice}/>
                    </div>
        )
    } else if (this.state.projectMode ==="create") {
      return (
          <div>
            <AddProject open={this.props.open} changeMode={this.props.changeMode}/>
            <CreateVis activeProject={currProject}/>
          </div>
        )
    } else {
      return (
        <div>
          <AddProject open={this.props.open} changeMode={this.props.changeMode}/>
          <ClaimDevice activeProject={currProject} token={this.props.token}/>
        </div>

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
