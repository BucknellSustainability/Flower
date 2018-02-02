import React, { Component } from 'react';
import logo from './logo.svg';
import './SensorContainer.css';
import Button from 'react-bootstrap/lib/Button';
import Carousel from 'react-bootstrap/lib/Carousel';
import axios from 'axios';


export class SensorContainer extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleSelect = this.handleSelect.bind(this);

    this.state = {
      index: 0,
      direction: null,
      sensors: [["Water Temp","Degrees F"], ["Air Temp", "Degrees C"]]
    };
  }

  handleSelect(selectedIndex, e) {
    //alert(`selected=${selectedIndex}, direction=${e.direction}`);
    this.setState({
      index: selectedIndex,
      direction: e.direction
    });
  }

  render() {
    const { index, direction } = this.state;
    return (
      <Carousel
        activeIndex={index}
        direction={direction}
        onSelect={this.handleSelect}
      >
      {this.state.sensors.map((sensor, i) =>
        <Carousel.Item eventKey={i}>

          <br /><br />
          <h2> SENSOR {i+1}: {sensor[0]} sensor </h2>
          <h2> UNITS: {sensor[1]} </h2>

        </Carousel.Item>
      )}
      </Carousel>


    );
  }
}