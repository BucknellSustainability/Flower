import React, { Component } from 'react';
import {Card, Divider, Row, Col, Form, Input, Tooltip, Icon, Select, Radio, Layout, Menu, Transfer, List, Button} from 'antd'
const { TextArea } = Input
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Header, Footer, Sider, Content } = Layout;


const mockData = [];
for (let i = 0; i < 10; i++) {
  mockData.push({
    key: i.toString(),
    title: `User ${i + 1}`,
    description: `This is user ${i + 1}`
  });
}
const targetKeys = mockData
        .filter(item => +item.key % 3 > 1)
        .map(item => item.key);


const data = [
  {
    title: 'Living Greenhouse',
    description: "Sustainable Greenhouse",
    lat: 0,
    long: 0
  },
  {
    title: 'Solar Array',
    description: "Bucknell's Own Solar Array",
    lat: 0,
    long: 0
  },
  {
    title: 'Water Tank',
    description: "Bucknell's Water Tank",
    lat: 0,
    long: 0
  }
];


export class AdminPanel extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      targetKeys,
      selectedKeys: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentWillMount(){
    //going to need to load all of the sites and get names
  }

  handleChange(nextTargetKeys, direction, moveKeys){
    this.setState({ targetKeys: nextTargetKeys });

    console.log('targetKeys: ', targetKeys);
    console.log('direction: ', direction);
    console.log('moveKeys: ', moveKeys);
  }

  handleSelectChange(sourceSelectedKeys, targetSelectedKeys){
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });

    console.log('sourceSelectedKeys: ', sourceSelectedKeys);
    console.log('targetSelectedKeys: ', targetSelectedKeys);
  }

  handleScroll(direction, e){
    console.log('direction:', direction);
    console.log('target:', e.target);
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

                <Row type="flex" justify="space-around" align="top">
                <Col span={11} style={{marginTop:20}}>
                  <Transfer
                    dataSource={mockData}
                    titles={['User List', 'Admin List']}
                    targetKeys={this.state.targetKeys}
                    selectedKeys={this.state.selectedKeys}
                    onChange={this.handleChange}
                    onSelectChange={this.handleSelectChange}
                    onScroll={this.handleScroll}
                    render={item => item.title}
                  />

                  <Button.Group size="large" style={{marginLeft:"18%", marginTop: 15}}>
                    <Button>
                      <Icon type="left" />Revert
                    </Button>
                    <Button>
                      Submit<Icon type="right" />
                    </Button>
                  </Button.Group>


                </Col>
                <Col span={11} style={{marginTop:20}}>

                <List
                  itemLayout="horizontal"
                  dataSource={data}
                  renderItem={site => (
                    <List.Item extra={(<Row type="flex" justify="center" align="top">
                                        <Col span={6}>
                                          <Button>edit</Button>
                                        </Col>
                                        <Col span={6}>
                                          <Button>delete</Button>
                                        </Col>
                                        </Row>)}>
                      <List.Item.Meta
                        title={site.title}
                        description={site.description + "\tLatitude: " + site.lat + " Longitude: " + site.long}
                      />
                    </List.Item>
                  )}
                />


                </Col>
                </Row>


              </Content>
            </Layout>
      );
  }
}