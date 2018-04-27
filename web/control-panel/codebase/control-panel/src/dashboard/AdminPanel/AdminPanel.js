import React, { Component } from 'react';
import {Card, Divider, Row, Col, Form, Button, Layout, Input} from 'antd'
const { Header, Footer, Sider, Content } = Layout;
const FormItem = Form.Item;



export class AdminPanel extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {

    };


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

                <Form layout="inline">
                  <FormItem label="Delete User">
                    <Input placeholder="email" />
                  </FormItem>
                  <FormItem>
                    <Button type="primary">Submit</Button>
                  </FormItem>
                </Form>

                <Form layout="inline">
                  <FormItem label="Promote User">
                    <Input placeholder="email" />
                  </FormItem>
                  <FormItem>
                    <Button type="primary">Submit</Button>
                  </FormItem>
                </Form>



              </Content>
            </Layout>
      );
  }
}