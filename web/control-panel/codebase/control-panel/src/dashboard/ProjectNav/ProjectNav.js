import React, {Component} from 'react';
import plus from '../../images/plus.svg';
import '../../fonts.css';
import {AddProject} from './AddProject.js';
import { Card,  Menu, Icon, Button, Row, Col, Modal} from 'antd';
const confirm = Modal.confirm;

export class ProjectNav extends Component{
  constructor(props){
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
  }

  componentDidMount(){
  }

  handleSelect(e) {
    if(e.key === "admin"){
      this.props.handler(e.key, 1);      
    } 
    else{
      this.props.handler(e.key, 0);   
    }

  }

  showDeleteConfirm(key, project) {
    let scope = this;
    confirm({
      title: 'Are you sure delete ' + project.name,
      content: "This action will unlink you from this Project.\n To rejoin the project select 'join' in the Add Projects field",
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        scope.props.deleteProj(key);
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      },
    });
}

  renderProjects(){
      if(this.props.user.projects.length > 0){
        return (
          this.props.user.projects.map((project, i) =>
          <Menu.Item key={i} onClick={this.handleSelect}>
            <Row>
              <Col span={18}>
                {project.name}
              </Col>
              <Col span={6}>
              <Button type="button" key={i} size="small" shape="circle" icon="delete" onClick={this.showDeleteConfirm.bind(this, i, project)}/>
              </Col>
            </Row>
          </Menu.Item>
        )
      )
    }
  }

  render() {
    return (

        <Menu
          style={{ width: "100%"}}
          defaultSelectedKeys={['0']}
          mode="inline"
          theme="dark"
          onClick={this.handleSelect}
        >
        <Menu.SubMenu key="myProjects" title={<span><Icon type="solution" /><span>My Projects</span></span>}>
              {this.renderProjects()}
        </Menu.SubMenu>
        <Menu.Item key="admin" onClick={this.handleSelect}>
          <span><Icon type="code"/><span>Admin Control Panel</span></span>
        </Menu.Item>


        </Menu>

    );
  }
}


