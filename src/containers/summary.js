import React, {Component} from 'react';
import {Route, IndexRoute} from 'react-router-dom';
import { firebase } from '../firebase';
import moment from 'moment';

class SummaryTab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entries: [],
      accounts: []
    };

    this.entriesRef = firebase.database().ref('entries');
    this.accountsRef = firebase.database().ref('accounts');

  }

  accountsSummary() {
    let summary = {
      totalDuration: 0,
      durationLogged: 0,
      durationNotLogged: 0,
      dateLastLogged: 0
    };

    this.state.entries.forEach(entry => {
      summary.totalDuration += Number(entry.duration);

      if(entry.logged){
        summary.durationLogged += Number(entry.duration);

        if (Number(entry.logged) > 1) {
          if (summary.dateLastLogged < entry.logged) summary.dateLastLogged = entry.logged;
        }
      } else {
        summary.durationNotLogged += Number(entry.duration);
      }
    });

    return (
      <tbody>
        <tr>
          <td><strong>Total Duration</strong></td>
          <td>{parseFloat(Math.round(summary.totalDuration * 100) / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td><strong>Duration Logged</strong></td>
          <td>{parseFloat(Math.round(summary.durationLogged * 100) / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td><strong>Duration Not Logged</strong></td>
          <td>{parseFloat(Math.round(summary.durationNotLogged * 100) / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td><strong>Date Last Logged</strong></td>
          <td>{ summary.dateLastLogged ? moment(new Date(summary.dateLastLogged)).format('MMM D, YYYY - HH:MMa') : 'N/A' }</td>
        </tr>
      </tbody>
    )
  }

  gatherAccounts() {
    const {accounts} = this.state;
    let accountsTotal = {};

    accounts.forEach(account => {
      this.state.entries.forEach(entry => {
        if (account.id === entry.account) {
          if (!accountsTotal[entry.account]) accountsTotal[entry.account] = {
            totalDuration: 0,
            durationLogged: 0,
            durationNotLogged: 0,
            dateLastLogged: 0,
            accountName: account.accountName
          };

          accountsTotal[entry.account].totalDuration += Number(entry.duration);

          if (entry.logged) {
            accountsTotal[entry.account].durationLogged += Number(entry.duration);

            if (Number(entry.logged) > 1) {
              if (accountsTotal[entry.account].dateLastLogged < entry.logged) {
                accountsTotal[entry.account].dateLastLogged = entry.logged;
              }
            }
          } else {
            accountsTotal[entry.account].durationNotLogged += Number(entry.duration);
          }

        }
      })
    });
    const returnJSX = [];

    for (let entry in accountsTotal) {
      returnJSX.push(<tr key={entry}>
        <td>{accountsTotal[entry].accountName}</td>
        <td>{parseFloat(Math.round(accountsTotal[entry].totalDuration * 100) / 100).toFixed(2)}</td>
        <td>{parseFloat(Math.round(accountsTotal[entry].durationLogged * 100) / 100).toFixed(2)}</td>
        <td>{parseFloat(Math.round(accountsTotal[entry].durationNotLogged * 100) / 100).toFixed(2)}</td>
        <td>{ accountsTotal[entry].dateLastLogged ? moment(new Date(accountsTotal[entry].dateLastLogged)).format('MMM D, YYYY - HH:MMa') : 'N/A' }</td>
      </tr>);
    }

    return returnJSX;
  }


  componentDidMount() {
    this.entriesRef.on('value', (snapshot) => {
      let entries = snapshot.val();
      let newState = [];
      for (let entry in entries) {
        newState.push({
          id: entry,
          account: entries[entry].account,
          date: entries[entry].date,
          description: entries[entry].description,
          duration: entries[entry].duration,
          logged: entries[entry].logged
        });
      }
      this.setState({
        entries: newState
      });
    });

    this.accountsRef.on('value', (snapshot) => {
      let accounts = snapshot.val();
      let newState = [];
      for (let account in accounts) {
        newState.push({
          id: account,
          accountName: accounts[account].accountName,
          date: accounts[account].accountNumber,
          description: accounts[account].clientName,
          duration: accounts[account].matterTitle
        });
      }
      this.setState({
        accounts: newState
      });
    });
  }


  componentWillUnmount() {
    this.entriesRef.off();
    this.accountsRef.off();
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-12 col-sm-8">
          <table className="table table-bordered">
            <thead>
            <tr>
              <th>Account Name</th>
              <th>Total Duration</th>
              <th>Duration Logged</th>
              <th>Duration Not Logged</th>
              <th>Date Last Logged</th>
            </tr>
            </thead>
            <tbody>
            {this.gatherAccounts()}
            </tbody>
          </table>
        </div>
        <div className="col-xs-12 col-sm-4">
          <table className="table table-bordered col-xs-12 col-sm-4">
            {this.accountsSummary()}
          </table>
        </div>
      </div>
    )
  }
}

export default SummaryTab;
