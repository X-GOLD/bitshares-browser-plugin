import React, { Component } from 'react';
import {Apis} from "bitsharesjs-ws";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from "react-router-dom";
import createBrowserHistory from 'history/createBrowserHistory';
//import {ChainWebSocket} from "bitsharesjs-ws/cjs/src/ChainWebSocket.js";
const browserHistory = createBrowserHistory();
//import {Login} from "bitsharesjs/es";
var bitsharesjs = require("bitsharesjs");
// var _bitsharesjsWs = require("bitsharesjs-ws");
var Login = bitsharesjs.Login;
var PrivateKey = bitsharesjs.PrivateKey;
var ChainStore = bitsharesjs.ChainStore;
let stat;
//var {ChainStore} = require("bitsharesjs");

// Apis.instance("wss://bitshares.openledger.info/ws", true).init_promise.then((res) => {
//     console.log("connected to:", res[0].network);
//     ChainStore.init().then(() => {
//         ChainStore.subscribe(updateState);
//     });
// });

// let dynamicGlobal = null;
// function updateState(object) {
//     dynamicGlobal = ChainStore.getObject("2.1.0");
//     console.log("ChainStore object update\n", dynamicGlobal ? dynamicGlobal.toJS() : dynamicGlobal);
// }

export default class Main extends Component {
  render() {
    return (
      <Router>
        <div className="main">
          dsfdfsfsd
          {stat}
        </div>
      </Router>
      
       // <button id="sendData" > send </button>
      // <div className="App">
      //   <header className="App-header">
      //     <img src={logo} className="App-logo" alt="logo" />
      //     <h1 className="App-title">Welcome to React</h1>
      //   </header>
      //   <p className="App-intro">
      //     To get started, edit <code>src/App.js</code> and save to reload.
      //   </p>
      // </div>
    );

  }
}