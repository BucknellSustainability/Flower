import React, {Component} from 'react';
import './ProjectNav.css';
import '../../fonts.css';
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
          <h2 className="linda project-nav-header"> My Projects</h2>
          <Well className="project-nav-well" bsSize="small">
          <Nav bsStyle="pills project-nav" stacked activeKey={this.state.activeKey} onSelect={this.handleSelect}>
              {this.props.user.projects.map((project, i) =>
                <NavItem className="raise grow concert bold border border-black" eventKey={i} style={{marginLeft: 15, marginRight:15}}>
                  <div className="card p-3 text-center">
                    <Row>
                      <Col lg={10} md={10} sm={10} lgOffset={1} mdOffset={1} smOffset={1}>
                        <div class="card-header">
                          <Badge style={{marginRight:5}}> {project.id} </Badge> {project.name}
                        </div>
                        <div class="card-block">
                        </div>
                        <div class="card-footer text-muted">
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