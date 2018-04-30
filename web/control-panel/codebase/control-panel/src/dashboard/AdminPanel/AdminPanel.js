import React, { Component } from 'react';
import {Card, Divider, Row, Col, Form, Button, Layout, Input, message} from 'antd'
import Requests from '../../Requests.js'
const { Header, Footer, Sider, Content } = Layout;
const FormItem = Form.Item;



export class AdminPanel extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      deleteEmail: "",
      promoteEmail: ""

    };

    this.deleteUser = Requests.deleteUser.bind(this);
    this.promoteUser = Requests.updateUserAdmin.bind(this);


  }

  submitDelete(){
    this.deleteUser(this.state.deleteEmail)
    message.info("Deleted user " + this.state.deleteEmail)
  }

  submitPromote(){
    this.promoteUser(this.state.promoteEmail)
    message.info("Promoted user " + this.state.promoteEmail)
  }

  render() {
      return (
            <Layout theme="dark">
              <Header>
                  <Row type="flex" justify="space-around" align="top">
                        <span className="ubuntu white"> Admin Dashboard</span>
                  </Row>
              </Header>
              <Content>

              <div style={{position:"absolute", right: "50%"}}>
                <Form layout="inline">
                  <FormItem label="Delete User">
                    <Input placeholder="email" onChange={(e) => this.setState({deleteEmail: e.target.value})}/>
                  </FormItem>
                  <FormItem>
                    <Button type="primary" onClick={this.submitDelete.bind(this)}>Submit</Button>
                  </FormItem>
                </Form>

                <Form layout="inline">
                  <FormItem label="Promote User">
                    <Input placeholder="email" onChange={(e) => this.setState({promoteEmail: e.target.value})}/>
                  </FormItem>
                  <FormItem>
                    <Button type="primary" onClick={this.submitPromote.bind(this)}>Submit</Button>
                  </FormItem>
                </Form>
              </div>

              </Content>
            </Layout>
      );
  }
}