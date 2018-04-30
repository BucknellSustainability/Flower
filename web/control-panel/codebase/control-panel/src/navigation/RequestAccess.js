import React, { Component } from 'react';
import {Button, message} from 'antd'

const styles = {
  container: {
    zIndex: 3,
    height: '55%',
    width: '40%',
    minWidth: '450px',
    marginTop: '200px',
    justifyContent: 'center',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'white'
  }
};

/*
Page responsible for logging the user in
*/
class RequestAccess extends React.Component {
  constructor(props) {
    super(props);

  }

  sendRequest() {
    message.info('Request Sent! Please check your email soon for an approval message!');
    this.props.request()
  };

  render() {

    return (
        <div>
            <div style={{position:"absolute", top:"20%", right:"32%"}}>
              <h1 className="ubuntu bold">Energy Hill Dashboard</h1>
              <h3 className="ubuntu bold">Please Request Access to Enter The Control Panel</h3>
              <p className="ubuntu"> We will email an admin to review the permission request. Thanks for your pantience! </p>
              <Button onClick={this.sendRequest.bind(this)} size="large" style={{marginLeft: "30%"}}type="primary"> Request Access </Button>
            </div>
        </div>
    );
  }
}

export default RequestAccess;