import React, {Component} from 'react';
import './ProjectNav.css';
import plus from '../../images/plus.svg';
import '../../fonts.css';
import {AddProject} from './AddProject.js';
import {Button, Nav, NavItem, Well, Row, Col, Badge} from 'react-bootstrap/lib/';


export class ProjectNav extends Component{
  constructor(props){
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.state = {activeKey : 0}
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
          <Row>
          <Col lg={8} md={8} sm={8}>
            <h3 className="linda project-nav-header" style={{marginLeft:25}}> My Projects</h3>
          </Col>
          <Col lg={4} md={4} sm={4}>
            <AddProject/>
          </Col>
          </Row>
          <Well className="project-nav-well" bsSize="small">
          <Nav bsStyle="pills project-nav" stacked activeKey={this.state.activeKey} onSelect={this.handleSelect}>
              {this.props.user.projects.map((project, i) =>
                <NavItem className="raise grow concert bold border border-black" eventKey={i} style={{marginLeft: 15, marginRight:15}}>
                  <div className="card p-3 text-center">
                    <Row>
                      <Col lg={10} md={10} sm={10} lgOffset={1} mdOffset={1} smOffset={1}>
                        <div className="card-header">
                          <Badge style={{marginRight:5}}> {project.id} </Badge> {project.name}
                        </div>
                        <div className="card-block">
                        </div>
                        <div className="card-footer text-muted">
                          2 days ago
                        </div>
                      </Col>
                    </Row>
                  </div>
                </NavItem>
              )}

        </Nav>
        </Well>
        </div>
    );
  }
}


