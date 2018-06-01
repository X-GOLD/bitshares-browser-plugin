import React, { Component } from 'react';
import {
  Router,
  Route,
  Link,
  Redirect,
  withRouter,
  Switch
} from "react-router-dom";
import Modal from 'react-modal';

import './App.css';
import history from './history';
import PropTypes from 'prop-types';
import logo from './wal.png';
import './App.css';
import {Apis} from "bitsharesjs-ws";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip'
//var numeral = require('numeral');
var bitsharesjs = require("bitsharesjs");
var Login = bitsharesjs.Login;
var PrivateKey = bitsharesjs.PrivateKey;
var ChainStore = bitsharesjs.ChainStore;
var FetchChain = bitsharesjs.FetchChain;
var keyUtils = bitsharesjs.key;
var TransactionHelper = bitsharesjs.TransactionHelper;
var Aes = bitsharesjs.Aes;
var TransactionBuilder = bitsharesjs.TransactionBuilder;
// var server = "wss://bitshares.openledger.info/ws";
// var nameCurrency = 'BTS';
// var urlRegister = 'https://faucet.bitshares.eu/api/v1/accounts';
var server = "wss://node.testnet.bitshares.eu";
var nameCurrency = 'TEST';
var urlRegister = 'https://faucet.testnet.bitshares.eu/api/v1/accounts';

let dataKey;


class App extends Component {
render () {
   return (
     <Router history={history}>
       <Switch>
         <Route exact path='/' component={Auth} />
         <Route path='/main' component={Main} />
         <Route path='/register' component={Register} />
         <Route path='/completeRegister' component={completeRegister} />
       </Switch>
     </Router>
     //
   )
}
}
/*transaction window*/
class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
        modalStatusIsOpen: false,
        modalIsOpen: false,
        currencyNoformat: false,
        currency: false,
        idCurrency: false,
        modalFrom: false,
        modalTo: false,
        modalQuantity: false,
        modalMessage: false,
        modalFee: false,
        modalFeeShow: false
    };
    // this.openModalStatus = this.openModalStatus.bind(this);
    // this.closeModalStatus = this.closeModalStatus.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  componentDidMount() {
    var _this = this;
    if (dataKey) {
      var accName = dataKey.saveAccName;
      var accPass = dataKey.savePass;
    }
    else {
      var accName = 'fdfdgffdg';
      var accPass = 'P5JtLaTvJzVKqFeE3hkV1VTJ3muw8U6RP6F8r1zdKBaza';
      // var accName = 'sdf-werg';
      // var accPass = 'P5JrEh78993Rp97AsvB5CwNR7tiEzKeb2DXxydjJDbVw3E';
    }
    /*get accont balance*/
    var private_key = PrivateKey.fromSeed( accName + 'owner' + accPass );
    let pKey = private_key;
    Apis.instance(server, true).init_promise.then((res) => {
        console.log("connected to:", res[0].network_name, "network");
        ChainStore.init().then(() => {
          Promise.all([
              Apis.instance().db_api().exec("get_key_references", [[pKey.toPublicKey().toPublicKeyString()]]),
              Apis.instance().db_api().exec("lookup_asset_symbols", [[nameCurrency]]),
          ]).then(res => {
            let [idAcc, idVal] = res;
            Apis.instance().db_api().exec( "get_account_balances", [ idAcc[0][0], [idVal[0].id] ] )
                .then( balance_objects => {
                  var amountBalance = balance_objects[0].amount;
                  console.log(amountBalance);
                  var amountBalanceFormat = this.formatInp(amountBalance);
                  console.log(amountBalanceFormat);
                  //var amountBalanceFormat = numeral(amountBalance).format('0.00000');
                  amountBalanceFormat = this.styleBalance(amountBalanceFormat);
                  var amountID = balance_objects[0].asset_id;
                  _this.setState({
                      currencyNoformat: amountBalance,
                      currency: amountBalanceFormat,
                      idCurrency: amountID
                  });
              });   
          });

        });
    });
  }
  /*function for formatting balance as ',' (balance) and return balance*/
  styleBalance(s) {
    var d = s.indexOf('.');
    var s2 = d === -1 ? s : s.slice(0, d);
    for (var i = s2.length - 3; i > 0; i -= 3) {
      s2 = s2.slice(0, i) + ',' + s2.slice(i);
    }
    if (d !== -1) {
      s2 += s.slice(d);
    }
    return s2;
  }
  /*function for formatting balance as 5 symbols after '.' (balance) and return balance*/
  formatInp(s) {
    var s = s.toString();
    var num;
    if (s.length == 1) {
      num = '0.0000' + s;
    }
    else if (s.length == 2) {
      num = '0.000' + s;
    }
    else if (s.length == 3) {
      num = '0.00' + s;
    }
    else if (s.length == 4) {
      num = '0.0' + s;
    }
    else if (s.length == 5) {
      num = '0.' + s;
    }
    else {
      num = s.slice(0, -5) + "." + s.slice(-5);
    }
    return num;
  }
  /*open modal with confirm transaction*/
  openModal() {
    this.setState({modalIsOpen: true});
  }
  /*close modal with confirm transaction*/
  closeModal() {
    this.setState({modalIsOpen: false});
  }

/*
<div className="fee-but">
                <div>
                  <p className="name-lable">fee</p>
                  <input type="text" disabled id="fee" />
                </div>
                <button onClick={this.validate}>Send</button>
              </div>*/
  render() {
    return (
        <div className="main-page">
            <header>
              <h2>Transfer details</h2>
            </header>
            <div className="main-page-data">
              <p className="name-lable">From</p>
              <input type="text" id="fromUser"  />
              <p className="name-lable">To</p>
              <input type="text" id="toUser" />
              <p className="name-lable"><span>Quantity</span><span className="spanRight">Available: {this.state.currency} {nameCurrency}</span></p>
              <input type="text" id="quantity" onBlur={this.validateCurrency}  onFocus={this.validateCurrency} onKeyUp={this.validateCurrency} />
              <p className="name-lable">Memo/Message</p>
              <textarea id="memoText" rows="3" />
              <div className="login-error-acc"></div>
              <button className="create-button" onClick={this.validate}>Send</button>
            </div>
            <Modal
              isOpen={this.state.modalIsOpen}
              onRequestClose={this.closeModal}>
              <div className="modal-page">
                <header>
                  <img src={logo}  />
                  <h2>Please confirm the transaction</h2>
                </header>
              <div className="modal-page-data">
                <table className="table op-table">
                <tbody>
                  <tr><td>
                    <span className="txtlabel success">Transfer</span>
                  </td>
                  <td></td></tr><tr><td>
                  <span>From</span></td><td>{this.state.modalFrom}</td></tr>
                  <tr><td><span>To</span></td><td>{this.state.modalTo}</td></tr>
                  <tr><td><span>Quantity</span></td><td><span className=""><span>{this.state.modalQuantity}</span><span className="currency">{nameCurrency}</span></span></td></tr>
                  <tr><td><span>Message</span></td><td className="memo">{this.state.modalMessage}</td></tr>
                  <tr><td><span>Fee</span></td><td><span className="facolor-fee"><span>{this.state.modalFeeShow} </span><span className="currency">{nameCurrency}</span></span></td></tr>
                </tbody>
                </table>
                <div className="button-group">
                  <button className="create-button" onClick={this.transfer}>Confirm</button>
                  <button className="create-button button hollow primary" onClick={this.closeModal}>close</button>
                </div>
              </div>
              </div>
            </Modal>
            <Modal overlayClassName="trOverlayModal" className="trModal"
              isOpen={this.state.modalStatusIsOpen}
              onRequestClose={this.closeModalStatus}>
              <div className="modal-page status">
              <div className="modal-page-data status">
                <p>Transaction confirmed<span className="icon checkmark-circle icon-1x success positionSymbol"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28"><title>check-circle</title><path d="M20.062 11.469c0-.266-.094-.531-.281-.719l-1.422-1.406c-.187-.187-.438-.297-.703-.297s-.516.109-.703.297l-6.375 6.359-3.531-3.531c-.187-.187-.438-.297-.703-.297s-.516.109-.703.297l-1.422 1.406c-.187.187-.281.453-.281.719s.094.516.281.703l5.656 5.656c.187.187.453.297.703.297.266 0 .531-.109.719-.297l8.484-8.484a.981.981 0 0 0 .281-.703zM24 14c0 6.625-5.375 12-12 12S0 20.625 0 14 5.375 2 12 2s12 5.375 12 12z"></path></svg></span></p> 
                <p>{this.state.modalFrom} sent {this.state.modalQuantity} {nameCurrency} to {this.state.modalTo} </p>
                <button className="create-button" onClick={this.status}>Ok, let's go</button>
              </div>
              </div>
            </Modal>
        </div>  
        
        //
    );
  }

  /*delete incorrect symbols from currency input*/
  validateCurrency = (e) => {
    var str = e.target.value,
    reg = /[\d\.]/,
    str = str.replace(",", ".").replace(/^\./, "0.").replace(/^0(\d)/, "$1"),
    len = 30 < str.length ? 30 : str.length,
    b = 0;
    for (; b < len && reg.test(str.charAt(b)); b++) "." == str.charAt(b) && (reg = /\d/, len = b + 6);
    e.type == "blur" && (str = str.replace(/\.$/, ""))
    document.querySelector("#quantity").value = str.slice(0, b)

  }
  /*confirm success transaction and go to the main */
  status = (e) => {
    this.setState({modalStatusIsOpen: false});
    history.go("/main");
  }
  /*confirm transaction and sending tr */
  transfer = (e) => {
    if (dataKey) {
      var accName = dataKey.saveAccName;
      var accPass = dataKey.savePass;
    }
    else {
      var accName = 'fdfdgffdg';
      var accPass = 'P5JtLaTvJzVKqFeE3hkV1VTJ3muw8U6RP6F8r1zdKBaza';
    }
    var private_key = PrivateKey.fromSeed( accName + 'active' + accPass );
    let pKey = private_key;
              var transfCurrency = this.state.modalQuantity;
              var transfFrom = this.state.modalFrom;
              var transfTo = this.state.modalTo;
              var transfText = this.state.modalMessage;
              var transfFee = this.state.modalFee;

              let fromAccount = transfFrom;
              let memoSender = fromAccount;
              let memo = transfText;

              let toAccount = transfTo;

              let sendAmount = {
                  amount: transfCurrency * 100000,
                  asset: nameCurrency
              }
              Promise.all([
                      FetchChain("getAccount", fromAccount),
                      FetchChain("getAccount", toAccount),
                      FetchChain("getAccount", memoSender),
                      FetchChain("getAsset", sendAmount.asset),
                      FetchChain("getAsset", sendAmount.asset)
                  ]).then((res)=> {
                       
                      let [fromAccount, toAccount, memoSender, sendAsset, feeAsset] = res;

                      let memoFromKey = memoSender.getIn(["options","memo_key"]);
                      console.log("memo pub key:", memoFromKey);
                      let memoToKey = toAccount.getIn(["options","memo_key"]);
                      let nonce = TransactionHelper.unique_nonce_uint64();

                      let memo_object = {
                          from: memoFromKey,
                          to: memoToKey,
                          nonce,
                          message: Aes.encrypt_with_checksum(
                              pKey,
                              memoToKey,
                              nonce,
                              memo
                          )
                      }
                      let tr = new TransactionBuilder()

                      tr.add_type_operation( "transfer", {
                          fee: {
                              amount: transfFee,
                              asset_id: feeAsset.get("id")
                          },
                          from: fromAccount.get("id"),
                          to: toAccount.get("id"),
                          amount: { amount: sendAmount.amount, asset_id: sendAsset.get("id") },
                          memo: memo_object
                      } )
                      tr.set_required_fees().then(() => {
                          tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());
                          console.log("serialized transaction:", tr.serialize());
                          var status = tr.serialize();
                          if (status.operations) {
                            this.setState({modalStatusIsOpen: true, modalIsOpen: false}); 
                          }
                          else {
                            this.setState({modalIsOpen: false});
                            document.querySelector('.login-error-acc').innerHTML = status.message;

                          }
                          //status.code, status.message
                          tr.broadcast();
                      })
                  });

  }
  /*validate form of transaction, get fee and open window with confirm transaction*/
  validate = (e) => {
    document.querySelector('.login-error-acc').innerHTML = "";
    if (dataKey) {
      var accName = dataKey.saveAccName;
      var accPass = dataKey.savePass;
    }
    else {
      var accName = 'fdfdgffdg';
      var accPass = 'P5JtLaTvJzVKqFeE3hkV1VTJ3muw8U6RP6F8r1zdKBaza';
    }
    var private_key = PrivateKey.fromSeed( accName + 'active' + accPass );
    let pKey = private_key;
    Apis.instance(server, true)
      .init_promise.then((res) => {
        console.log("connected to:", res[0].network_name, "network");
        ChainStore.init().then(() => {
          var nameTo = document.querySelector("#toUser").value;
          Apis.instance().db_api().exec( "lookup_accounts", [ nameTo, 1 ] ).then( data => {
              var getNameApi = data[0][0];
              var transfCurrency = document.querySelector("#quantity").value;
              var transfFrom = document.querySelector("#fromUser").value;
              var transfTo = document.querySelector("#toUser").value;
              var transfText = document.querySelector("#memoText").value;
              if (transfFrom.length == 0) {
                document.querySelector('.login-error-acc').innerHTML = "Please write name account from";
              }
              else if (isNaN(parseFloat(transfCurrency)) ) {
                document.querySelector('.login-error-acc').innerHTML = "Currency must be only numbers";
              }
              else if (transfCurrency > this.state.currency - 0.001 && transfCurrency > 0) {
                document.querySelector('.login-error-acc').innerHTML = "You don't have that amount of currency";
              }
              else if (accName != transfFrom) {
                document.querySelector('.login-error-acc').innerHTML = "It's not your account, please write your name account from";
              }
              else if (getNameApi != nameTo) {
                document.querySelector(".login-error-acc").innerHTML = "Account to does not exists";
              }
              else if (getNameApi == accName) {
                document.querySelector(".login-error-acc").innerHTML = "Account FROM cannot be equal to account TO";
              }
              else if (transfText.length == 0) {
                document.querySelector(".login-error-acc").innerHTML = "Please, write message";
              }
              else if (transfText.length > 150) {
                document.querySelector(".login-error-acc").innerHTML = "Soo longer message";
              }
              else {
                let fromAccount = transfFrom;
                let memoSender = fromAccount;
                let memo = transfText;

                let toAccount = transfTo;

                let sendAmount = {
                    amount: transfCurrency * 100000,
                    asset: nameCurrency
                }
                Promise.all([
                      FetchChain("getAccount", fromAccount),
                      FetchChain("getAccount", toAccount),
                      FetchChain("getAccount", memoSender),
                      FetchChain("getAsset", sendAmount.asset),
                      FetchChain("getAsset", sendAmount.asset)
                  ]).then((res)=> {
                       
                      let [fromAccount, toAccount, memoSender, sendAsset, feeAsset] = res;

                      let memoFromKey = memoSender.getIn(["options","memo_key"]);

                      let memoToKey = toAccount.getIn(["options","memo_key"]);
                      let nonce = TransactionHelper.unique_nonce_uint64();

                      let memo_object = {
                          from: memoFromKey,
                          to: memoToKey,
                          nonce,
                          message: Aes.encrypt_with_checksum(
                              pKey,
                              memoToKey,
                              nonce,
                              memo
                          )
                      }
                      Apis.instance().db_api().exec("get_required_fees", [
                          [[1,{
                          fee: {
                              amount: 0,
                              asset_id: feeAsset.get("id")
                          },
                          from: fromAccount.get("id"),
                          to: toAccount.get("id"),
                          amount: { amount: sendAmount.amount, asset_id: sendAsset.get("id") },
                          memo: memo_object
                        }]],"1.3.0"
                      ]).then( data => {
                        this.setState({modalIsOpen: true,
                          modalFrom: transfFrom,
                          modalTo: transfTo,
                          modalQuantity: transfCurrency,
                          modalMessage: transfText,
                          modalFee: data[0].amount,
                          modalFeeShow: data[0].amount / 100000
                        }); 
                      });
                  });
                                     
                }
            });    
    });
});
  }
}
/*status of registration window*/
class completeRegister extends Component {
  constructor() {
    super()
    this.state = {
     pass: false,
     status: true 
    }
  }
  render() {
    const { pass, status } = this.state;
    return (
        <div className="register-page">
          <header className="App-header">
            <img src={logo}  />
            <h2>Create account</h2>
          </header>
          <div className="acc-creation-page-data">
            <p>Create a backup</p>
            <p>In case you haven't already done so, it is crucial that you take the time to write down your password now, whether it be on paper, a password manager, or somewhere else. If you lose or forget this password your account will be lost, we cannot help you get it back.</p>
            {status && (
              <button className="create-button name-lable" onClick={this.showPass.bind(this)}>Show my password</button>
            )}
            {pass && (
                <div className="showP">
                    <h4>Password</h4>
                    <p>{pass}</p>
                </div>
            )}
            <div className="divider"></div>
            <p className="txtlabel warning"><span><strong>IMPORTANT: If you forget your pass phrase you will be unable to access your account, we cannot reset or restore your password! Make sure you memorize or write down your password!</strong></span></p>
            <button className="create-button name-lable" onClick={this.goMain}>Ok, go to transaction</button>
          </div>
        </div>
        
        //
    );
  }
  /*show password of success registred account*/
  showPass = (e) => {
    this.setState({
      status: false,
      pass: dataKey.savePass
    });
  }
  /*lets go to transaction window*/
  goMain = (e) => {
      history.push("/main");
  }
}
/*register window*/
class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {pass: 'P' + keyUtils.get_random_key().toWif().substr(0, 45)};
  }
  render() {
    return (
        <div className="register-page">
          <header className="App-header">
            <img src={logo}  />
            <h2>Create account</h2>
          </header>
          <div className="login-page-data">
            <p className="name-lable">Account name (public)</p>
            <input type="text" id="accName" placeholder="account name" />
            <p className="name-lable positionSymbol" placeholder="password">generated password</p><span className="positionSymbol" data-tip data-for="passMessage" ><span className="icon question-circle"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28"><title>question-circle</title><path d="M14 21.5v-3c0-.281-.219-.5-.5-.5h-3c-.281 0-.5.219-.5.5v3c0 .281.219.5.5.5h3c.281 0 .5-.219.5-.5zM18 11c0-2.859-3-5-5.688-5-2.547 0-4.453 1.094-5.797 3.328a.49.49 0 0 0 .125.656l2.063 1.563a.477.477 0 0 0 .297.094.498.498 0 0 0 .391-.187c.734-.938 1.047-1.219 1.344-1.437.266-.187.781-.375 1.344-.375 1 0 1.922.641 1.922 1.328 0 .812-.422 1.219-1.375 1.656-1.109.5-2.625 1.797-2.625 3.313v.562c0 .281.219.5.5.5h3c.281 0 .5-.219.5-.5 0-.359.453-1.125 1.188-1.547 1.188-.672 2.812-1.578 2.812-3.953zm6 3c0 6.625-5.375 12-12 12S0 20.625 0 14 5.375 2 12 2s12 5.375 12 12z"></path></svg></span></span>
            <ReactTooltip id='passMessage' effect='solid'>
              The generated password was created by your browser, locally. <br /><br /><strong>No one but you has access to it</strong>.<br /><br /> Paste it below and save a copy in a safe place
            </ReactTooltip>
            <input type="text" value={this.state.pass} ref={(input) => this.textArea = input} disabled id="generatedPassword" />
            <CopyToClipboard text={this.state.pass}>
              <button type="button" className="buttonCopy"><span className="icon clippy"><svg className="svg-icon"><path fill="#FFF" d="M17.391 2.406H7.266a.423.423 0 0 0-.422.422v3.797H3.047a.423.423 0 0 0-.422.422v10.125c0 .232.19.422.422.422h10.125a.423.423 0 0 0 .422-.422v-3.797h3.797c.232 0 .422-.19.422-.422V2.828a.424.424 0 0 0-.422-.422M12.749 16.75h-9.28V7.469h3.375v5.484c0 .231.19.422.422.422h5.483v3.375zm4.22-4.219H7.688V3.25h9.281v9.281z"></path></svg></span></button>
            </CopyToClipboard>
            <p className="name-lable" placeholder="password">confirm password</p>
            <input type="password" id="confirmedPassword" />
            <div className="confirm-checks first"><label htmlFor="checkbox-1"><input type="checkbox" id="checkbox-1" value="on" /><div ><span>I understand that I will lose access to my funds if I lose my password</span></div></label></div>
            <br />
            <div className="confirm-checks"><label htmlFor="checkbox-2" ><input type="checkbox" id="checkbox-2" value="on" /><div ><span>I understand that no one can recover my password if I lose or forget it</span></div></label></div>
            <br />
            <div className="confirm-checks"><label htmlFor="checkbox-3"><input type="checkbox" id="checkbox-3" value="on" /><div ><span>I have written down or otherwise stored my password</span></div></label></div>
            <div className="login-error-acc"></div>
            <button className="create-button name-lable" onClick={this.createAcc}>Create account</button>
          </div>
        </div>
        
        //
    );
  }
  /*validate data and creating account*/
  createAcc = (e) => {
    var nameAcc = document.querySelector("#accName").value;
    document.querySelector(".login-error-acc").innerHTML = "";
    if (nameAcc.length < 3) {
      document.querySelector(".login-error-acc").innerHTML = "Account name should be longer";
    }
    else if (document.querySelector("#confirmedPassword").value.length < 12 || document.querySelector("#confirmedPassword").value != this.state.pass) {
      document.querySelector(".login-error-acc").innerHTML = "Password must be same";
    }
    else if (document.querySelector("#checkbox-1").checked == false || document.querySelector("#checkbox-2").checked == false || document.querySelector("#checkbox-3").checked == false) {
      document.querySelector(".login-error-acc").innerHTML = "Please check all points";
    }
    else {
      Apis.instance(server, true).init_promise.then((res) => {
        console.log("connected to:", res[0].network_name, "network");
        ChainStore.init().then(() => {
          Apis.instance().db_api().exec( "lookup_accounts", [ nameAcc, 1 ] ).then( data => {
            var getNameApi = data[0][0];
              if (getNameApi == nameAcc) {
                  document.querySelector(".login-error-acc").innerHTML = "This account name already exist. Please change it";
              }
              else {
                var keys = Login.generateKeys(nameAcc, this.state.pass, ["active", "owner", "memo"], nameCurrency);
                var sad = JSON.stringify({
                    account: {
                      name: nameAcc,
                      owner_key: keys.pubKeys.owner,
                      active_key: keys.pubKeys.active,
                      memo_key: keys.pubKeys.memo,
                    }
                  });
                fetch(urlRegister, {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  mode:"cors",
                  body: sad
                }).then((response) => response.json())
                  .then((responseJson) => {
                    console.log('all is success');
                    dataKey = { saveAccName: nameAcc, savePass: this.state.pass};
                    history.push("/completeRegister");
                  })
                  .catch((error) => {
                    document.querySelector(".login-error-acc").innerHTML = error.error.base["0"];
                    console.error(error);
                  });            
              }
          });          
        });
      });
    }
  }
}
/*auth window*/
class Auth extends Component {
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
            <button className="login-button name-lable" onClick={this.register}>Register</button>
          </div>
        </div>

//
    );

  }
  /*go to register window*/
  register() {
    history.push("/register");
  }
  /*validate login form and check account name and password for true result*/
  login() {
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
            server,
            true
        ).init_promise.then(function(result) {
            ChainStore.init().then(() => {

      var accName = document.querySelector("#userName").value;
      var accPass = document.querySelector("#userPassword").value;
      var keys = Login.generateKeys(accName, accPass, ["active", "owner", "memo"], nameCurrency);
      //console.log(keys);
      Apis.instance().db_api().exec("get_account_by_name", [accName]).then(res => {
        console.log(res);
          if (res && res.options.memo_key) {
            var accKeys = res.options.memo_key;
            var genKeys = keys.pubKeys.active;
            if (accKeys == genKeys) {
              // var private_key = PrivateKey.fromSeed(accName + 'owner' + accPass);
              // var sendKey = private_key.toWif();
              dataKey = { saveAccName: accName, savePass: accPass};
              history.push("/main");
            }
            else {
               document.querySelector(".login-error-acc.pass").innerHTML = "Incorrect login or password";
            }
          }
          else {
            document.querySelector(".login-error-acc.pass").innerHTML = "Incorrect login or password";
          }
        });
    });})
    }
  };
}
export default App