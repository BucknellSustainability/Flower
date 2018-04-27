import React, { Component } from 'react';
import './DeviceContainer.css';
import '../../../fonts.css';
import Requests from '../../../Requests.js';
import {UploadCode} from './UploadCode.js';
import {SensorContainers} from './Sensors/SensorContainers.js';
import { Card,  Menu, Icon, Button, Row, Col, Modal, Layout} from 'antd';
const confirm = Modal.confirm;
const { Header, Footer, Sider, Content } = Layout;


export class DeviceContainer extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleSelect = this.handleSelect.bind(this);
    this.deleteDevice = Requests.deleteDevice.bind(this);
  }

  handleSelect(e) {
    this.props.handler(e.key);
  }

  showDeleteConfirm(key, device) {
    let scope = this;
    confirm({
      title: 'Are you sure delete ' + device.name,
      content: <ol> 
            <li> Device is permantatly disconnected from the system. </li>
            <li> All sensors that belong to the device will stop collecting data</li>
            <li> You will still be able to visualize the sensors under the 'unclaimed' project </li>
          </ol>
      ,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        scope.props.deleteDevice();
        scope.deleteDevice(device.id)
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      },
    });
}

  renderDevices(){
    if(this.props.devices.length > 0){
      return (
      this.props.devices.map((device, i) =>

          <Menu.Item key={i} onClick={this.handleSelect} theme="light">
            <Row type="flex" justify="center" align="top">
              <Col span={18}>
                {device.name}
              </Col>
              <Col span={3}>
                <UploadCode device={device}/>
               </Col>
                <Col span={3}>
                <Button size="small" shape="circle" icon="delete" onClick={this.showDeleteConfirm.bind(this, i, device)}/>
               </Col>
            </Row>
          </Menu.Item>
      ))
    }
  }

  render() {

    if(this.props.device !== undefined){
      return (


          <Layout>
      <Sider id="deviceSider" theme="light" width="300" style={{ marginLeft: "2%", marginBottom: "2%", borderRadius: "5%", backgroundColor:"transparent"}}>
                 <Menu 
                  style={{borderRadius: "5%"}}
                  defaultSelectedKeys={['0']}
                  mode="inline"
                  onClick={this.handleSelect}
                >
                  {this.renderDevices()}
                </Menu>                

      </Sider>
      <Layout theme="light">
        <Content>
            <SensorContainers sensors={this.props.device.sensors}/>
        </Content>
      </Layout>
    </Layout>



      )}
    else{
      return (
        <div style={{margin: 30}}>
        <Card title={<span> No Devices Attached To Project<Icon style={{marginLeft: 20}} type="frown-o"/></span>}>
          Claim a device by selecting the "Claim New Device" tab above.
        </Card>  
        </div>
      );
    }
  }
}
