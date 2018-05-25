import React, { Component } from 'react';
import logo from './wal.png';
import './App.css';
import {Apis} from "bitsharesjs-ws";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from "react-router-dom";
import history from './history'
import PropTypes from 'prop-types';

//import {ChainWebSocket} from "bitsharesjs-ws/cjs/src/ChainWebSocket.js";
//import {Login} from "bitsharesjs/es";
var bitsharesjs = require("bitsharesjs");
// var _bitsharesjsWs = require("bitsharesjs-ws");
var Login = bitsharesjs.Login;
var PrivateKey = bitsharesjs.PrivateKey;
var ChainStore = bitsharesjs.ChainStore;

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

export default class Auth extends Component {
  render() {
    return (
        <div className="log-page">
          <header className="App-header">
            <img src={logo}  />
            <h2>Cloud Wallet Login</h2>
          </header>
          <div className="login-page-data">
            <p className="name-lable">Account name</p>
            <input type="text" id="userName" placeholder="account name" />
            <div className="login-error-acc name"></div>
            <p className="name-lable" placeholder="password">password</p>
            <input type="password" id="userPassword" />
            <div className="login-error-acc pass"></div>
            <button className="login-button name-lable" onClick={this.login}>Login</button>
          </div>
        </div>
      
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
  login() {
    history.push("/main");
    document.querySelector(".login-error-acc.name").innerHTML = "";
    document.querySelector(".login-error-acc.pass").innerHTML = "";
    if (document.querySelector("#userName").value == "") {
      document.querySelector(".login-error-acc.name").innerHTML = "Enter user name";
    }
    if (document.querySelector("#userPassword").value == "") {
      document.querySelector(".login-error-acc.pass").innerHTML = "Enter password";
    }
    if (document.querySelector("#userPassword").value.length < 12) {
      document.querySelector(".login-error-acc.pass").innerHTML = "Password must have at least 12 characters";
    }
    if (document.querySelector("#userName").value != "" && document.querySelector("#userPassword").value != "" && document.querySelector("#userPassword").value.length > 11) {
      // var accName = "test-ei";
      // var accPass = "P5JussgYdgVoP8YWC3kFwcztcXt878tqYiVv4YKuGVd7v";
      Apis.instance(
            "wss://bitshares.openledger.info/ws",
            true
        ).init_promise.then(function(result) {
            ChainStore.init().then(() => {

      var accName = document.querySelector("#userName").value;
      var accPass = document.querySelector("#userPassword").value;
      var keys = Login.generateKeys(accName, accPass, ["active", "owner", "memo"], 'BTS');
      // var private_key = PrivateKey.fromSeed(accName + 'owner' + accPass);
      // var sdf = private_key.toWif();
      // var public_key = private_key.toPublicKey().toString("BTS");
      // var auths = [];
      //   auths["owner"] = [];
      //   auths["owner"][0] = [];
      //   auths["owner"][0][0] = public_key;
      //   auths["owner"][0][1] = 1;
      // let success = Login.checkKeys({
      //   accountName: accName,
      //   password: accPass,
      //   auths: auths
      // });
      // console.log(public_key);
      // console.log(success);
      console.log(keys)
      ChainStore.subscribe(function() {
        Apis.instance().db_api().exec("get_account_by_name", [accName]).then(res => {
          // Apis.instance().db_api().exec("get_vesting_balances", [res.id]).then(resd => {
          //   console.log(resd);
          // });
            console.log(res);
        });
        // Apis.instance().wallet_api().exec("get_account", ['test-ei']).then(res => {
        //   console.log(res);
        // });
        // var ChainWebSocket = new ChainWebSocket();
        // var d = ChainWebSocket.login(accName,accPass);
        // console.log(d);
        var account = ChainStore.getAccount(accName);
        //console.log(account);
        var sa = ChainStore.accounts_by_name.get('test-ei');
          if (account) {
            let owner_authority = account.get("owner");
            let active_authority = account.get("active");
            // console.log( owner_authority );
            //  console.log( active_authority );
          }
      });

      // if (success == true) {
      //   const path = '/result';
      //   browserHistory.push(path);
      //   window.sessionStorage.setItem('key', keys);
      // }
      // else {
      //   document.querySelector(".login-error-acc.pass").value = "Invalid user name or password";
      // }
      //console.log(keys);
    });})
    }
  };
}

// document.addEventListener("DOMContentLoaded", function(event) {
//     document.querySelector("#sendData").addEventListener("click", function() {
//       var accName = "test-ei";
//       var accPass = "P5JussgYdgVoP8YWC3kFwcztcXt878tqYiVv4YKuGVd7v";
//       // console.log(Login.generateKeys(accName, accPass, ["active", "owner", "memo"]));
//       var keys = Login.generateKeys(accName, accPass, ["active"], 'BTS');
//       var auths = [];
//       auths["active"] = [];
//       auths["active"][0] = [];
//       auths["active"][0][0] = keys.pubKeys.active;
//       console.log(Login.generateKeys(accName, accPass, ["active"], 'BTS'));
//       var activeKey = keys.pubKeys.active;
//       let success = Login.checkKeys({
//                 accountName: accName,
//                 password: accPass,
//                 auths: auths
//             });
//       var rightKey = activeKey.replace('GPH', 'BTS');
//       if (success == true) {      
// //BTS8KJTFfMLs93wRE4uXxH2xxace93RpbYUaBGGxehpjN8o8WsuEa
//         // signTransaction();
        // Apis.instance(
        //     "wss://bitshares.openledger.info/ws",
        //     true
        // ).init_promise.then(function(result) {
        //     ChainStore.init().then(() => {
        //       var rightKey = activeKey.replace('GPH', 'BTS');
             
//               ChainStore.subscribe(function(obj) {
//                 console.log(obj);
//                 var sar = ChainStore.getAccountRefsOfKey(rightKey);
//                 if (sar && sar._map._root.entries["0"]["0"]) {
//                   //console.log(ChainStore.getAsset(sar._map._root.entries["0"]["0"]));
//                 }
//                 console.log(ChainStore.fetchFullAccount('test-ei', true));
//                 console.log(ChainStore.getBalanceObjects('test-ei'));
//                 // console.log(sar);
//                 //     let account = ChainStore.getAccount(
//                 //         "test-ei"
//                 //     );
//                 //     console.log(account);
//                 //    let sa = ChainStore.fetchFullAccount(
//                 //         "test-ei"
//                 //     );
//                 //    console.log(sa);
//                 });
//               // console.log(sar);
//               // console.log(ChainStore.account_ids_by_key);
//               //ChainStore.subscribe(function() {
//                 // let account = ChainStore.getAccount(
//                 //         accName
//                 //     );
//                 // console.log(account);
//                 // console.log(result);
//                 // var coreAsset = result[0].network.core_asset;
//                 // var coreAsset2 = result[0].network.chain_id;
//                 // console.log(coreAsset);
//                 // var a = ChainStore.getAsset(coreAsset);
//                 // console.log(a);
//                 // var b = ChainStore.getAsset(coreAsset2);
//                 // console.log(b);

//                 // var sar = ChainStore.getAccountRefsOfKey(activeKey);
//                 // console.log(sar);
//               //});
//             });
//         });
//         console.log(rightKey);
//       //   Apis.instance("wss://bitshares.openledger.info/ws", true).init_promise.then((result) => {
//       //     var coreAsset = result[0].network.core_asset;
//       //     console.log(coreAsset);
//       //     console.log(result);
//       //     Promise.all([
//       //         Apis.instance().db_api().exec("get_key_references", [[rightKey]]),
//       //     ])
//       //     .then(res => {
//       //       console.log(res);
//       //         var data = res[0][0];
//       //         var asd = res[0][0][0];
//       //         console.log(asd);
//       //         let fullAccounts = [];
//       //         var sdf = ChainStore.getAccount('test-ei');
//       //         console.log(sdf);
//       //         // Apis.instance().db_api().exec("lookup_asset_symbols", [[coreAsset]]).then(res => {
//       //         //       console.log(res);
//       //         //   });
//       //         // Apis.instance().db_api().exec("get_account_balances", [asd, [coreAsset]]).then(res => {
//       //         //       console.log(res);
//       //         //   });
//       //         data.forEach(id => {
//       //             if (fullAccounts.indexOf(id) === -1) {
//       //                 fullAccounts.push(id);
//       //             }
//       //         });
//       //         Apis.instance().db_api().exec("get_full_accounts", [fullAccounts, true]).then(accounts => {
//       //             accounts.forEach(account => {
//       //                 console.log("account:", account[1].account);
//       //             });
//       //         });
              
//       //     });
//       // });

//         // var init = ChainStore.init();
//         // console.log(init);
//         // var cache = ChainStore.clearCache();
//         // console.log(cache);
//         // console.log(ChainStore.get_account_refs_of_keys_calls);
//         // console.log(activeKey);
//         // var sar = ChainStore.getAccountRefsOfKey(activeKey);
//         // console.log(sar);
//       }
//       else {
//         console.log("invalid keys");
//       }
//       console.log(success);
//     });
// });
