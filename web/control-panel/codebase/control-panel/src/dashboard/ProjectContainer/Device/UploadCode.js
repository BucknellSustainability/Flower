import React, { Component } from 'react';
import '../../../fonts.css';
import Requests from '../../../Requests.js';
import {UploadAlert} from './UploadAlert.js'
import { Modal, Button, Upload, message, Icon} from 'antd';


export class UploadCode extends React.Component {
  
  constructor(props){
    super(props)

    this.state = {
      uploading: false,
      errorMsg: "",
      visible: false,
      fileList: []
    }

    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.uploadSuccess = this.uploadSuccess.bind(this);
    this.uploadError = this.uploadError.bind(this);

    this.uploadCode = Requests.uploadFile.bind(this);
    this.checkUploadStatus = Requests.checkUploadStatus.bind(this);


    this.handleUpload = this.handleUpload.bind(this);
  }



  handleUpload(){
    const codeFile = this.state.fileList[0];

    this.setState({
      uploading: true,
    });

    this.uploadCode(codeFile)
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

  uploadSuccess() {
    message.info('Code Upload Success!');
  };

  uploadError(errorMsg){
    message.error('Code Upload Failure: ' + errorMsg);
  }

  render() {
    const {uploading, visible, file} = this.state;
    const props = {
      action: 'https://www.eg.bucknell.edu/energyhill/store-code',
      onRemove: (file) => {
        this.setState(({ fileList: []}))
      },
      beforeUpload: (file) => {
        this.setState(({ fileList }) => ({
          fileList: [file],
        }));
        return false;
      },
      fileList: this.state.fileList,
    };


    return (
      <div>
        <Button size="small" shape="circle" icon="cloud-upload-o" onClick={this.showModal} />
        <Modal
          visible={visible}
          title="Upload Code"
          size="large"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
           footer={[<Button
          className="upload-demo-start"
          type="primary"
          onClick={this.handleUpload}
          disabled={this.state.fileList.length === 0}
          loading={uploading}
        >
          {uploading ? 'Uploading' : 'Start Upload' }
        </Button>]}
        >
        <Upload {...props}>
          <Button>
            <Icon type="upload" /> Select File
          </Button>
        </Upload>

        </Modal>
      </div>
    );
  }
}
