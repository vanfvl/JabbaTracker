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
          try {
            item.accountName = accounts[items[key].account].accountName;
            item.accountNumber = accounts[items[key].account].accountNumber;
            item.clientName = accounts[items[key].account].clientName;
            item.matterTitle = accounts[items[key].account].matterTitle;
          } catch(e) {
            console.log(e);
          }
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
        try {
          newEntries.push({
            ...item,
            accountNumber: accounts[item.account] ? accounts[item.account].accountNumber : undefined,
            clientName: accounts[item.account] ? accounts[item.account].clientName : undefined,
            accountName: accounts[item.account] ? accounts[item.account].accountName : undefined,
            matterTitle: accounts[item.account] ? accounts[item.account].matterTitle : undefined,
          })
        } catch(e) {
          console.log(item, e);
        }
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
