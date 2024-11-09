import React, { Component } from 'react'
import { firebase } from '../firebase'
import Autocomplete from 'react-autocomplete'
import { Link, Prompt } from 'react-router-dom'

const NUMBER_OF_ROWS = 20

class Input extends Component {
  constructor(props) {
    super(props)

    this.state = {
      formValues: [],
      accounts: [],
      submitted: false,
      selectedRow: null,
      hasUnsavedChanges: false
    }

    this.entriesRef = firebase.database().ref('entries')
    this.accountsRef = firebase.database().ref('accounts')
  }

  componentDidMount() {
    window.onbeforeunload = (e) => {
      if (this.state.hasUnsavedChanges) {
        e.preventDefault()
        return 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    this.accountsRef.on('value', (snapshot) => {
      const items = snapshot.val()
      const accounts = []

      for (let key in items) {
        let item = {
          id: key,
          ...items[key]
        }

        accounts.push(item)
      }

      this.setState({ accounts })
    })

    this.resetFormValues()
  }

  componentWillUnmount() {
    this.accountsRef.off()
    window.onbeforeunload = null
  }

  matchStateToTerm(item, value) {
    return item.accountName.toLowerCase().indexOf(value.toLowerCase()) !== -1
  }

  sortResults(a, b, value) {
    const aLower = a.accountName.toLowerCase()
    const bLower = b.accountName.toLowerCase()
    const valueLower = value.toLowerCase()
    const queryPosA = aLower.indexOf(valueLower)
    const queryPosB = bLower.indexOf(valueLower)
    if (queryPosA !== queryPosB) {
      return queryPosA - queryPosB
    }
    return aLower < bLower ? -1 : 1
  }

  resetFormValues() {
    const formValues = []

    for (let i = 0; i < NUMBER_OF_ROWS; i++) {
      formValues.push({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        errorDate: '',
        accountName: '',
        account: null,
        errorAccountName: '',
        hour: '',
        min: '',
        errorTime: '',
        duration1: '',
        duration2: '',
        errorDuration: '',
        description: '',
        errorDescription: ''
      })
    }

    this.setState({
      formValues
    })
  }

  handleChange(idx, e) {
    const { formValues } = this.state

    formValues[idx][e.target.name] = e.target.value

    this.setState({
      formValues,
      hasUnsavedChanges: true
    })
  }

  handleChangeHour(idx, e) {
    const { formValues } = this.state

    formValues[idx][e.target.name] = e.target.value

    if (e.target.value.length >= 2) {
      e.target.parentNode.children[1].focus()
    }

    this.setState({
      formValues
    })
  }

  handleReturn(e) {
    if (e.keyCode == '13') {
      this.handleSubmit()
    }
  }

  findAccountByName(accountName) {
    return this.state.accounts.find((item) => item.accountName === accountName)
  }

  handleSubmit() {
    const entriesToPush = []
    const { formValues } = this.state
    let hasError = false

    formValues.forEach((item) => {
      item.errorDate = ''
      item.errorAccountName = ''
      item.errorTime = ''
      item.errorDuration = ''
      item.errorDescription = ''

      if (item.hour === '' && item.min === '' && item.duration1 === '' && item.description === '') {
        return false
      }

      if (item.month === '' || item.day === '') {
        item.errorDate = 'Please enter a valid date.'
        hasError = true
      }

      if (!item.account) {
        item.errorAccountName = 'Please select a valid account.'
        hasError = true
      }

      if (item.hour === '' || item.min === '') {
        item.errorTime = 'Please enter a valid time.'
        hasError = true
      }

      if (item.duration1 === '' && item.duration2 === '') {
        item.errorDuration = 'Please enter a valid duration.'
        hasError = true
      }

      if (item.description === '') {
        item.errorDescription = 'Please enter a description.'
        hasError = true
      }

      if (hasError) return false

      const entry = {
        account: item.account.id,
        date: new Date(
          item.year || '2017',
          item.month - 1,
          item.day,
          item.hour,
          item.min
        ).getTime(),
        description: item.description,
        duration: `${item.duration1 || 0}.${item.duration2 || 0}`,
        logged: false
      }

      entriesToPush.push(entry)
    })

    if (hasError) {
      this.setState({ formValues })
      return false
    }

    if (entriesToPush.length > 0) {
      entriesToPush.forEach((entry) => this.entriesRef.push(entry))
      this.setState({ submitted: true, hasUnsavedChanges: false })
      this.resetFormValues()
    }
  }

  renderRows() {
    const changeAccount = (value, idx) => {
      const { formValues } = this.state

      formValues[idx].accountName = value
      formValues[idx].account = this.findAccountByName(value)

      return formValues
    }

    const { selectedRow } = this.state

    return this.state.formValues.map((row, idx) => (
      <tr key={idx}>
        <td
          className={this.state.formValues[idx].errorAccountName && 'has-error'}
          style={{ display: 'flex', gap: '0.5em' }}
        >
          <Autocomplete
            getItemValue={(item) => item.accountName}
            inputProps={{ className: 'form-control' }}
            wrapperStyle={{ width: '100%', display: 'inline-block' }}
            items={this.state.accounts}
            renderItem={(item, isHighlighted) => (
              <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                {item.accountName}
              </div>
            )}
            value={this.state.formValues[idx].accountName}
            shouldItemRender={this.matchStateToTerm}
            sortItems={this.sortResults}
            onChange={(e, value) =>
              this.setState({ formValues: changeAccount(value, idx), hasUnsavedChanges: true })
            }
            onSelect={(value) =>
              this.setState({ formValues: changeAccount(value, idx), hasUnsavedChanges: true })
            }
          />
          {this.state.formValues[idx].account && (
            <button
              type="button"
              onClick={() => {
                const { formValues } = this.state
                formValues[idx].accountName = ''
                formValues[idx].account = null

                this.setState({
                  formValues
                })
              }}
            >
              <img src="/delete.png" alt="delete" style={{ width: '20px' }} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const { formValues } = this.state
              for (let i = idx + 1; i < NUMBER_OF_ROWS; i++) {
                formValues[i].accountName = formValues[idx].accountName
                formValues[i].account = formValues[idx].account
              }

              this.setState({
                formValues
              })
            }}
          >
            <img src="/copy.png" alt="copy" style={{ width: '20px' }} />
          </button>
          {this.state.formValues[idx].errorAccountName && (
            <span className="help-block">{this.state.formValues[idx].errorAccountName}</span>
          )}
        </td>
        <td className={this.state.formValues[idx].errorDate && 'has-error'}>
          <input
            type="text"
            name="year"
            className="form-control year"
            placeholder="2017"
            value={this.state.formValues[idx].year}
            onChange={(e) => this.handleChange(idx, e)}
          />
          <input
            type="text"
            name="month"
            className="form-control month"
            placeholder="MM"
            value={this.state.formValues[idx].month}
            onChange={(e) => this.handleChange(idx, e)}
          />
          <input
            type="text"
            name="day"
            className="form-control day"
            placeholder="DD"
            value={this.state.formValues[idx].day}
            onChange={(e) => this.handleChange(idx, e)}
          />

          {this.state.formValues[idx].errorDate && (
            <span className="help-block">{this.state.formValues[idx].errorDate}</span>
          )}
        </td>
        <td className={this.state.formValues[idx].errorTime && 'has-error'}>
          <input
            type="text"
            name="hour"
            className="form-control time"
            placeholder="00"
            value={this.state.formValues[idx].hour}
            onChange={(e) => this.handleChangeHour(idx, e)}
          />
          :
          <input
            type="text"
            name="min"
            className="form-control time"
            placeholder="00"
            value={this.state.formValues[idx].min}
            onChange={(e) => this.handleChange(idx, e)}
          />
          {this.state.formValues[idx].errorTime && (
            <span className="help-block">{this.state.formValues[idx].errorTime}</span>
          )}
        </td>
        <td className={this.state.formValues[idx].errorDuration && 'has-error'}>
          <input
            type="text"
            name="duration1"
            className="form-control duration"
            placeholder="0"
            value={this.state.formValues[idx].duration1}
            onChange={(e) => this.handleChange(idx, e)}
          />
          .
          <input
            type="text"
            name="duration2"
            className="form-control duration"
            placeholder="00"
            value={this.state.formValues[idx].duration2}
            onChange={(e) => this.handleChange(idx, e)}
          />
          {this.state.formValues[idx].errorDuration && (
            <span className="help-block">{this.state.formValues[idx].errorDuration}</span>
          )}
        </td>
        <td className={this.state.formValues[idx].errorDescription && 'has-error'}>
          <input
            type="text"
            name="description"
            className="form-control description"
            placeholder="Description"
            value={this.state.formValues[idx].description}
            onChange={(e) => this.handleChange(idx, e)}
            onKeyDown={(e) => this.handleReturn(e)}
          />
          {this.state.formValues[idx].errorDescription && (
            <span className="help-block">{this.state.formValues[idx].errorDescription}</span>
          )}
        </td>

        <style jsx>{`
          input {
            display: inline-block;
          }
          .time,
          .duration {
            width: 48%;
            text-align: right;
          }

          .time:last-child,
          .duration:last-child {
            margin-right: 0;
            text-align: left;
          }

          .year {
            width: 60px;
            margin-right: 2px;
          }

          .month {
            width: 50px;
            margin-right: 2px;
          }

          .day {
            width: 50px;
            margin-right: 2px;
          }
        `}</style>
      </tr>
    ))
  }

  render() {
    return (
      <div>
        <Prompt
          when={this.state.hasUnsavedChanges}
          message="You have unsaved changes. Are you sure you want to leave?"
        />

        <button className="btn btn-success" onClick={() => this.handleSubmit()}>
          Submit
        </button>

        <table className="table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th width="190">Date</th>
              <th width="120">Time</th>
              <th width="120">Duration</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>{this.renderRows()}</tbody>
        </table>

        <button className="btn btn-success" onClick={() => this.handleSubmit()}>
          Submit
        </button>

        {this.state.submitted && (
          <div className="bg-success">
            <strong>Success!</strong> Please <Link to="/">click here</Link> to go to the Time Sheet
            tab.
          </div>
        )}

        <style jsx>{`
          .bg-success {
            padding: 10px;
            margin-left: 1em;
            display: inline-block;
          }
        `}</style>
      </div>
    )
  }
}

export default Input
