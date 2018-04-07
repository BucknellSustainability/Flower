import React, { Component } from 'react';
import '../../../fonts.css';
import {UploadAlert} from './UploadAlert.js'
import { Modal, Button, Upload, message, Icon} from 'antd';


export class UploadCode extends React.Component {
  
  constructor(props){
    super(props)

    this.state = {
      loading: false,
      visible: false,
    }

    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.options = {
      name: 'file',
      action: 'https://www.eg.bucknell.edu/energyhill/',
      headers: {
      authorization: 'MY TEXT'
      },
      onChange(info){
          if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
      }
    }
  }



  showModal() {
    this.setState({
      visible: true,
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



  render() {
    const { visible, loading } = this.state;
    return (
      <div>
        <Button size="small" shape="circle" onClick={this.showModal}> <Icon type="cloud-upload-o" style={{marginRight:"50%"}}/></Button>
        <Modal
          visible={visible}
          title="Upload Code"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          size="large"
          footer={[
            <Button key="back" onClick={this.handleCancel}>Cancel</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              Submit
            </Button>,
          ]}
        >
        <Upload {...this.options}>
          <Button>
            <Icon type="upload" /> Click to Upload
          </Button>
        </Upload>

        </Modal>
      </div>
    );
  }
}