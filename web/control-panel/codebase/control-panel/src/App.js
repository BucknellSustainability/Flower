import React, { Component } from 'react';
import './App.css';
import './fonts.css'
import Requests from './Requests.js'
import Navigation from './navigation/Navigation.js'
import {DashboardHeader} from './dashboard/DashboardHeader.js'

import { Layout, Menu, Icon, Divider, Card } from 'antd';
const {Meta} = Card;


class App extends Component {
  constructor() {
    super();
  }


  render() {
      return (
          <Navigation />
      )
    }
}

export default App;
