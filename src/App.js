import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import Edite from './edite'
// import Auto from './auto'
class App extends Component {
  render () {
    return (
      <div className="App">
        <div className="edite">
          <Edite  />
        </div>
      </div>
    );
  }
}

export default App;
