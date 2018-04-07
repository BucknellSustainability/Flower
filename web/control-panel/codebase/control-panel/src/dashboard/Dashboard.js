import React, { Component } from 'react';
import {ProjectContainer} from './ProjectContainer/ProjectContainer.js';
import {ProjectNav} from './ProjectNav/ProjectNav.js';
import {Row, Col, Layout} from 'antd'
import logo from '../images/logo.svg';
const { Header, Content, Footer, Sider } = Layout;


export class Dashboard extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.projectNavHandler = this.projectNavHandler.bind(this);
    this.deviceNavHandler = this.deviceNavHandler.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.deleteDevice = this.deleteDevice.bind(this);

    this.state = {
      activeProject: 0,
      activeDevice: 0,
      user: this.props.researcher
      }
    }

  deleteProject(i){
    let myUser = this.state.user;
    myUser.projects.splice(i, 1);
    let newActive = (myUser.projects.length > 0) ? 0 : -1;
    this.setState({user: myUser, activeProject: newActive});
  }

  deleteDevice(){
    let myUser = this.state.user;
    myUser.projects[this.state.activeProject].devices.splice(this.state.activeDevice, 1);
    let newActive = (myUser.projects[this.state.activeProject].devices.length > 0) ? 0 : -1;
    this.setState({user: myUser, activeDevice: newActive});
  }

  projectNavHandler(active) {
    this.setState({
      activeProject: active,
      activeDevice: 0
    })
  }

  deviceNavHandler(active){
    this.setState({
      activeDevice: active
    })
  }

  render() {
  	const projectNav = <ProjectNav user={this.state.user} handler={this.projectNavHandler} deleteProj={this.deleteProject}/>;
    const projectContainer = <ProjectContainer user={this.state.user} 
                                               handler={this.deviceNavHandler} 
                                               activeProject={this.state.activeProject} 
                                               activeDevice={this.state.activeDevice}
                                               deleteDevice={this.deleteDevice}/>


    return (


    <Layout>
      <Header>       
        <Row type="flex" justify="space-around" align="center">        
          <Col span={1}>
          <a href="#home"><img src={logo} className="App-logo" alt="logo" /></a>
          </Col>
          <Col span={8}>
          <h2 style={{margin:"auto", marginTop:15}} className="white bold ubuntu">Energy Hill Dashboard</h2>
          </Col>
          <Col span={14}>
          </Col>
        </Row>
      </Header>


      <Layout>
        <Sider  breakpoint="lg"
                collapsedWidth="0"
                width="245"
                onCollapse={(collapsed, type) => { console.log(collapsed, type); }}
                style={{top:"-80"}}>            
              <div className="logo" />
              {projectNav}
        </Sider>
        <Content> 
            <div style={{ padding: "2%", background: '#fff', minHeight: 360 }}>
                {projectContainer} 
            </div>
        </Content>
      </Layout>
    </Layout>

    );
  }

}
