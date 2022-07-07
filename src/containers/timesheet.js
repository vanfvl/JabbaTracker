import React, { Component } from 'react'
import { firebase } from '../firebase'
import TableTime from '../components/tabletime'

const PAGE_SIZE = 10

class TimeSheet extends Component {
  constructor(props) {
    super(props)

    this.state = {
      entries: [],
      lastEntry: undefined,
      accounts: {}
    }

    this.entriesRef = firebase
      .database()
      .ref('entries')
      .orderByChild('date')
      .limitToLast(PAGE_SIZE + 1)
    this.accountsRef = firebase.database().ref('accounts')
  }

  componentDidMount() {
    this.refreshEntries()

    this.accountsRef.once('value', (snapshot) => {
      const accounts = snapshot.val()
      const { entries } = this.state

      let newEntries = []

      entries.forEach((item) => {
        newEntries.push({
          ...item,
          accountNumber: accounts[item.account].accountNumber,
          clientName: accounts[item.account].clientName,
          accountName: accounts[item.account].accountName,
          matterTitle: accounts[item.account].matterTitle
        })
      })

      if (newEntries.length > 0) this.setState({ accounts, entries: newEntries })
      else this.setState({ accounts })
    })
  }

  componentWillUnmount() {
    this.entriesRef.off()
    this.accountsRef.off()
  }

  refreshEntries = () => {
    this.entriesRef.once('value', (snapshot) => {
      const items = snapshot.val()
      let entries = []
      const { accounts } = this.state

      for (let key in items) {
        let item = {
          id: key,
          ...items[key]
        }

        if (accounts[items[key].account]) {
          item.accountName = accounts[items[key].account].accountName
          item.accountNumber = accounts[items[key].account].accountNumber
          item.clientName = accounts[items[key].account].clientName
          item.matterTitle = accounts[items[key].account].matterTitle
        }

        entries.push(item)
      }

      entries.sort((a, b) => b.date - a.date)

      this.setState({ entries: entries.slice(0, PAGE_SIZE), lastEntry: entries[PAGE_SIZE] })
    })
  }

  handleNext = (ev) => {
    const { lastEntry } = this.state

    if (!lastEntry) return false

    this.entriesRef = firebase
      .database()
      .ref('entries')
      .orderByChild('date')
      .endAt(lastEntry.date, lastEntry.id)
      .limitToLast(PAGE_SIZE + 1)

    this.refreshEntries()
  }

  render() {
    return (
      <div className="h-full">
        {this.state.entries.length > 0 && (
          <div className="h-full">
            <TableTime entries={this.state.entries} accounts={this.state.accounts} />
            <button onClick={this.handleNext}>Next</button>
          </div>
        )}
      </div>
    )
  }
}

export default TimeSheet
