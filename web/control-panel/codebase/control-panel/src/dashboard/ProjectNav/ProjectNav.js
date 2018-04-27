import React, {Component} from 'react';
import plus from '../../images/plus.svg';
import '../../fonts.css';
import { Card,  Menu, Icon, Button, Row, Col, Modal} from 'antd';
import Requests from '../../Requests.js'
const MenuItemGroup = Menu.ItemGroup;
const confirm = Modal.confirm;

export class ProjectNav extends Component{
  constructor(props){
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.unlinkProject = Requests.unlinkProject.bind(this);

    this.deleteProject = Requests.deleteProject.bind(this);
  }

  componentDidMount(){
  }

  handleSelect(e) {
    if(e.key === "admin"){
      this.props.handler(e.key, 2);      
    } 
    else if (e.key === "add"){
      this.props.handler(e.key, 1)
    }
    else{
      this.props.handler(e.key, 0);   
    }
  }

  // Add back later
  //scope.unlinkProject(project.id)
  insertAdminPanel(){
    if(this.props.user.is_admin === 1){
      return (
          <Menu.Item key="admin" onClick={this.handleSelect}>
            <span><Icon type="code"/><span>Admin Control Panel</span></span>
          </Menu.Item>
        )
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
        scope.deleteProject(project.id)
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
              <Col span={19}>
                {project.name}
              </Col>
              <Col span={5}>
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
          defaultOpenKeys={['myProjects']}
          mode="inline"
          theme="dark"
          onClick={this.handleSelect}
        >
        <Menu.SubMenu key="myProjects" title={<span><Icon type="solution" /><span>My Projects</span></span>}>
              {this.renderProjects()}
              <Menu.Item key="add" onClick={this.handleSelect}>
                <span><Icon type="plus"/><span>Add Project</span></span>
              </Menu.Item>
        </Menu.SubMenu>

        {this.insertAdminPanel()}

        </Menu>

    );
  }
}


