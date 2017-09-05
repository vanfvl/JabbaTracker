import React, { Component } from 'react';
import { firebase } from '../firebase';
import TableTime from '../components/tabletime';

class TimeSheet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entries: [],
      accounts: {}
    };

    this.entriesRef = firebase.database().ref('entries');
    this.accountsRef = firebase.database().ref('accounts');
  }

  componentDidMount() {
    this.entriesRef.on('value', (snapshot) => {
      const items = snapshot.val();
      let entries = [];
      const { accounts } = this.state;

      for (let key in items) {
        let item = {
          id: key,
          ...items[key],
        };

        if (accounts[items[key].account]) {
          item.accountName = accounts[items[key].account].accountName;
          item.accountNumber = accounts[items[key].account].accountNumber;
          item.clientName = accounts[items[key].account].clientName;
          item.matterTitle = accounts[items[key].account].matterTitle;
        }

        entries.push(item);
      }

      this.setState({entries});
    });

    this.accountsRef.on('value', (snapshot) => {
      const accounts = snapshot.val();
      const { entries } = this.state;

      let newEntries = [];

      entries.forEach(item => {
        newEntries.push({
          ...item,
          accountNumber: accounts[item.account].accountNumber,
          clientName: accounts[item.account].clientName,
          accountName: accounts[item.account].accountName,
          matterTitle: accounts[item.account].matterTitle,
        })
      });

      if (newEntries.length > 0)
        this.setState({accounts, entries: newEntries});
      else
        this.setState({accounts});
    });
  }

  componentWillUnmount() {
    this.entriesRef.off();
    this.accountsRef.off();
  }

  render() {
    return (
      <div>
        { this.state.entries.length > 0 &&
          <TableTime entries={this.state.entries} accounts={this.state.accounts} />
        }
      </div>
    )
  }
}

export default TimeSheet;
