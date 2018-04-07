import React, { Component } from 'react';
import '../../fonts.css';
import { Modal, Button, message, Icon, Row, Col, Form, Input, Divider, Select} from 'antd';
import Requests from '../../Requests.js'
const FormItem = Form.Item;
const Option = Select.Option;


export class AddProject extends React.Component {
  
  constructor(props){
    super(props)

    this.state = {
      loading: false,
      visible: false,
    }

    this.createProject = Requests.createProject.bind(this);

    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }


  showModal() {
    this.setState({
      visible: true,
      projectName: ""
    });
  }

  handleOk() {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, visible: false });
    }, 3000);
  }
  handleCancel () {
    this.setState({ visible: false });
  }

  handleNameChange(e){
    this.setState({projectName: e.target.value})
  }

  handleCreateProject(){
    this.createProject(this.state.projectName);
  }



  render() {
    const { visible, loading } = this.state;

    const formLayout = "horizontal";
    const formItemLayout = formLayout === 'horizontal' ? {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 },
    } : null;
    const buttonItemLayout = formLayout === 'horizontal' ? {
      wrapperCol: { span: 14, offset: 4 },
    } : null;

    return (
      <div>
        <Button type="primary" shape="circle" icon="plus-circle-o" onClick={this.showModal}/>
        <Modal
          visible={visible}
          title="Add Project"
          onCancel={this.handleCancel}
          style={{width: "100%"}}
          footer={null}
        >

        <Row type="flex" justify="space-around" align="top">
          <Col span={11} align="center">
              <Form layout={formLayout}>
                <FormItem
                  label="Choose Project Name"
                  {...formItemLayout}
                >
                  <Input placeholder="Enter Name" onChange={this.handleNameChange.bind(this)}/>
                  <Button type="primary" icon="plus" style={{marginTop:20}} onClick={this.handleCreateProject.bind(this)}>
                    Create Project
                  </Button>
                </FormItem>
              </Form>
          </Col>

          <Col span={11} align="center">
              <Form layout={formLayout}>
                <FormItem
                  label="Join an Existing Project"
                  {...formItemLayout}
                >
                  <Select defaultValue="greenhouse" style={{ width: 200 }}>
                    <Option value="greenhouse">Living Greenhouse</Option>
                    <Option value="test">Test Project</Option>
                  </Select>
                  <Button type="primary" icon="link" style={{marginTop:20}}>Join Project</Button>
                </FormItem>
              </Form>
          </Col>

        </Row>

        </Modal>
      </div>
    );
  }
}
