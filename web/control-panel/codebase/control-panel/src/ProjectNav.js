import React, { Component } from 'react';
import './ProjectNav.css';
import Button from 'react-bootstrap/lib/Button';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Well from 'react-bootstrap/lib/Well'


export class ProjectNav extends Component{
  constructor(props){
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.state = {activeKey : 0,
                  projects: ["Living Greenhouse", "Solar Array"]
    }
  }

  componentDidMount(){
  }

  handleSelect(selectedKey) {
    this.setState({activeKey: selectedKey});
    this.props.handler(selectedKey);
  }

  render() {
    return (
          <div className="ProjectNav"> 
          <Well bsSize="small">
          <h4> {this.props.user.name}{"'"}s Projects </h4>
          <Nav bsStyle="pills" stacked activeKey={this.state.activeKey} onSelect={this.handleSelect}>
              {this.state.projects.map((project, i) =>
                <NavItem eventKey={i}>{project}</NavItem>
              )}
        </Nav>
        </Well>
        </div>
    );
  }
}