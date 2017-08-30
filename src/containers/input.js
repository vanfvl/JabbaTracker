import React, {Component} from 'react';
import firebase from '../firebase';
import Autocomplete from 'react-autocomplete';

class Input extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: [],
      accounts: []
    };

    this.entriesRef = firebase.database().ref('entries');
    this.accountsRef = firebase.database().ref('accounts');
  }

  componentDidMount() {
    this.accountsRef.on('value', (snapshot) => {
      const items = snapshot.val();
      const accounts = [];

      for (let key in items) {
        let item = {
          id: key,
          ...items[key],
        };

        accounts.push(item);
      }

      this.setState({accounts});
    });

    this.resetFormValues();
  }

  componentWillUnmount() {
    this.accountsRef.off();
  }

  matchStateToTerm(item, value) {
    return (
      item.accountName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    )
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
    const numberOfRows = 10;
    const formValues = [];

    for (let i = 0; i < numberOfRows; i++) {
      formValues.push({
        year: '',
        month: '',
        day: '',
        accountName: '',
        account: null,
        hour: '',
        min: '',
        duration1: '',
        duration2: '',
        description: ''
      })
    }

    this.setState({
      formValues
    })
  }

  handleChange(idx, e) {
    const {formValues} = this.state;

    formValues[idx][e.target.name] = e.target.value;

    this.setState({
      formValues
    });
  }

  findAccountByName(accountName) {
    return this.state.accounts.find((item) => item.accountName === accountName);
  }

  handleSubmit() {
    this.state.formValues.forEach(item => {
      if ( item.month !== '' &&
        item.day !== '' &&
        item.account &&
        item.hour !== '' &&
        item.min !== '' &&
        item.duration1 !== '' &&
        item.description !== '' ) {
        const entry = {
          account: item.account.id,
          date: new Date(item.year || '2017', item.month, item.day, item.hour, item.min).getTime(),
          description: item.description,
          duration: `${item.duration1}.${item.duration2}`,
          logged: false
        };

        this.entriesRef.push(entry);
      }
    });

    this.resetFormValues();
  }

  renderRows() {
    const changeAccount = (value, idx) => {
      const {formValues} = this.state;

      formValues[idx].accountName = value;
      formValues[idx].account = this.findAccountByName(value);

      return formValues;
    };

    return this.state.formValues.map((row, idx) => (
      <tr key={idx}>
        <td>
          <input type="text" name="year" className="form-control year" placeholder="2017"
                 value={this.state.formValues[idx].year} onChange={(e) => this.handleChange(idx, e)}/>
          <input type="text" name="month" className="form-control month" placeholder="MM"
                 value={this.state.formValues[idx].month} onChange={(e) => this.handleChange(idx, e)}/>
          <input type="text" name="day" className="form-control day" placeholder="DD"
                 value={this.state.formValues[idx].day} onChange={(e) => this.handleChange(idx, e)}/>
        </td>
        <td>
          <Autocomplete
            getItemValue={(item) => item.accountName}
            inputProps={{className: 'form-control'}}
            wrapperStyle={{width: '100%', display: 'inline-block'}}
            items={this.state.accounts}
            renderItem={(item, isHighlighted) =>
              <div style={{background: isHighlighted ? 'lightgray' : 'white'}}>
                { item.accountName }
              </div>
            }
            value={this.state.formValues[idx].accountName}
            shouldItemRender={this.matchStateToTerm}
            sortItems={this.sortResults}
            onChange={(e, value) => this.setState({formValues: changeAccount(value, idx)}) }
            onSelect={(value) => this.setState({formValues: changeAccount(value, idx)}) }
          />
        </td>
        <td>
          <input type="text" name="hour" className="form-control time" placeholder="00"
                 value={this.state.formValues[idx].hour} onChange={(e) => this.handleChange(idx, e)}/>:
          <input type="text" name="min" className="form-control time" placeholder="00"
                 value={this.state.formValues[idx].min} onChange={(e) => this.handleChange(idx, e)}/>
        </td>
        <td>
          <input type="text" name="duration1" className="form-control duration" placeholder="0"
                 value={this.state.formValues[idx].duration1} onChange={(e) => this.handleChange(idx, e)}/>.
          <input type="text" name="duration2" className="form-control duration" placeholder="00"
                 value={this.state.formValues[idx].duration2} onChange={(e) => this.handleChange(idx, e)}/>
        </td>
        <td>
          <input type="text" name="description" className="form-control description" placeholder="Description"
                 value={this.state.formValues[idx].description} onChange={(e) => this.handleChange(idx, e)}/>
        </td>

        <style jsx>{`
          input { display: inline-block; }
          .time, .duration {
            width: 48%;
            text-align: right;
          }

          .time:last-child, .duration:last-child {
            margin-right: 0;
            text-align: left;
          }

          .year {
            width: 38%;
            margin-right: 2px;
          }

          .month {
            width: 29%;
            margin-right: 2px;
          }

          .day {
            width: 29%;
            margin-right: 2px;
          }
        `}</style>
      </tr>
    ));
  }

  render() {
    return (
      <div>
        <table className="table">
          <thead>
          <tr>
            <th>Date</th>
            <th width="22%">Account Name</th>
            <th width="120">Time</th>
            <th width="120">Duration</th>
            <th width="40%">Description</th>
          </tr>
          </thead>
          <tbody>
          { this.renderRows() }
          </tbody>
        </table>

        <button className="btn btn-success" onClick={() => this.handleSubmit()}>Submit</button>
      </div>
    )
  }
}

export default Input;
