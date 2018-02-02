import React, { Component } from 'react';
import logo from './logo.svg';
import './ProjectContainer.css';
import Button from 'react-bootstrap/lib/Button';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import axios from 'axios';


export class ProjectContainer extends Component{
  constructor(props){
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.state = {activeKey : 1,
                  projects: ["Living Greenhouse", "Solar Array", "Water Tower"]}
  }

  componentDidMount(){
    //fetch
    axios.get('../../../../php/db.php?table=site&condition= &fields=*')
      .then(res => {
        const projList = res.data.data.children.map(obj => obj.data);
        alert("Trying to read db")
        this.setState({ projects: projList });
      });
  }

  handleSelect(selectedKey) {
    this.setState({activeKey: selectedKey});
    alert(`selected ${selectedKey} ${this.state.projects[selectedKey]}`);
  }

  render() {
    return (
          <div className="ProjectNav"> 
          <h3> {this.props.user}{"'"}s Projects </h3>
          <Nav bsStyle="pills" stacked activeKey={this.state.activeKey} onSelect={this.handleSelect}>
              {this.state.projects.map((project, i) =>
                <NavItem eventKey={i}>{project}</NavItem>
              )}
        </Nav>
        </div>
    );
  }
}
