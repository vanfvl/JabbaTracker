import React, {Component} from 'react';
import {Route, IndexRoute} from 'react-router-dom';
import firebase from '../firebase';
import SortHeader from '../components/DataTable/sortHeader';
import DataListWrapper from '../components/DataTable/dataListWrapper';
import DataWrapper from '../components/DataTable/dataWrapper';
import SortTypes from '../components/DataTable/sortTypes';

class AccountsTab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accountName: '',
      accountNumber: '',
      clientName: '',
      matterTitle: '',
      accounts: [],
      selectedIds: [],
      editMode: false,
      editId: '',
      sortedDataList: new DataListWrapper([], []),
      colSortDirs: [],
    };

    this._dataList = {};
    this._defaultSortIndexes = [];

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this._onSortChange = this._onSortChange.bind(this);
  }

  componentDidMount() {
    const accountsRef = firebase.database().ref('accounts');
    accountsRef.on('value', (snapshot)=> {
      let accounts = snapshot.val();
      let newState = [];
      for (let account in accounts) {
        newState.push({
          id: account,
          accountName: accounts[account].accountName,
          accountNumber: accounts[account].accountNumber,
          clientName: accounts[account].clientName,
          matterTitle: accounts[account].matterTitle
        });
      }
      this.setState({
        accounts: newState
      }, () => {
        this.initializeSortedList();
      })
    })
  }

  initializeSortedList() {
    this._dataList = new DataWrapper(this.state.accounts);

    this._defaultSortIndexes = [];
    const size = this._dataList.getSize();
    for (let index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    this.setState({
      sortedDataList: new DataListWrapper(this._defaultSortIndexes, this._dataList),
      colSortDirs: this._defaultSortIndexes,
    })
  }

  _onSortChange(columnKey, sortDir) {
    var sortIndexes = this._defaultSortIndexes.slice();
    sortIndexes.sort((indexA, indexB) => {
      var valueA = this._dataList.getObjectAt(indexA)[columnKey];
      var valueB = this._dataList.getObjectAt(indexB)[columnKey];

      var sortVal = 0;
      if (valueA > valueB) {
        sortVal = 1;
      }
      if (valueA < valueB) {
        sortVal = -1;
      }
      if (sortVal !== 0 && sortDir === SortTypes.ASC) {
        sortVal = sortVal * -1;
      }

      return sortVal;
    });

    this.setState({
      sortedDataList: new DataListWrapper(sortIndexes, this._dataList),
      colSortDirs: {
        [columnKey]: sortDir,
      },
    });
  }

  //catch-all handleChange method that receives the event from
  // our inputs, and updates that input's corresponding piece of state
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit(e) {
    //we need to prevent the default behavior of the form, which if we don't will cause
    // the page to refresh when you hit the submit button.
    e.preventDefault();
    const accountsRef = firebase.database().ref('accounts');
    const account = {
      accountName: this.state.accountName,
      accountNumber: this.state.accountNumber,
      clientName: this.state.clientName,
      matterTitle: this.state.matterTitle
    };
    accountsRef.push(account);
    this.setState({
      accountName: '',
      accountNumber: '',
      clientName: '',
      matterTitle: ''
    });
  }

  handleEdit(e) {
    e.preventDefault();
    const accountRef = firebase.database().ref(`/accounts/${this.state.editId}`);
    accountRef.set({
      accountName: this.state.accountName,
      accountNumber: this.state.accountNumber,
      clientName: this.state.clientName,
      matterTitle: this.state.matterTitle
    }, this.toggleEdit);
  }

  removeItem(accountId) {
    const accountRef = firebase.database().ref(`/accounts/${accountId}`);
    accountRef.remove();
  }

  toggleEdit() {
    this.setState({
      editMode: !this.state.editMode
    }, () => {
      if(this.state.editMode) {
        this.state.editId = this.state.selectedIds[0];
        const findId = (account) => {
          return account.id === this.state.editId;
        };
        let tempItem = this.state.accounts.find(findId);

        this.setState({
          accountName: tempItem.accountName,
          accountNumber: tempItem.accountNumber,
          clientName: tempItem.clientName,
          matterTitle: tempItem.matterTitle
        })
      } else {
        this.setState({
          accountName: '',
          accountNumber: '',
          clientName: '',
          matterTitle: '',
          editId: ''
        })
      }
    });
  }


  render() {
    const {sortedDataList, colSortDirs} = this.state;

    return (
      <div className="row">
        <div className="col-xs-12 col-sm-9">
          <div className="wrapper">
            <div className="buttons">
              <button className="btn btn-default" onClick={() => {this.toggleEdit()}}>{ this.state.editMode ? "Cancel" : "Edit" }</button>
              <button className="btn btn-default" onClick={()=>{
                this.state.selectedIds.forEach((account)=>{
                  this.removeItem(account);
                });
                this.setState({selectedIds:[]})

              }}>Delete</button>
            </div>
            <table className="table table-bordered">
              <thead>
              <tr>
                <th>#</th>
                <SortHeader
                  columnKey="accountName"
                  onSortChange={this._onSortChange}
                  sortDir={colSortDirs.accountName}>
                  Account Name
                </SortHeader>
                <SortHeader
                  columnKey="accountNumber"
                  onSortChange={this._onSortChange}
                  sortDir={colSortDirs.accountNumber}>
                  Account Number
                </SortHeader>
                <SortHeader
                  columnKey="clientName"
                  onSortChange={this._onSortChange}
                  sortDir={colSortDirs.clientName}>
                  Client Name
                </SortHeader>
                <SortHeader
                  columnKey="matterTitle"
                  onSortChange={this._onSortChange}
                  sortDir={colSortDirs.matterTitle}>
                  Matter Title
                </SortHeader>
              </tr>
              </thead>
              <tbody>
              {sortedDataList.getArrayData() && sortedDataList.getArrayData().map((account)=> {
                return (
                  <tr key={account.id}>
                    <th><div className="checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={this.state.selectedIds.indexOf(account.id) !== -1}
                          onChange={()=>{
                            /*
                             * onChange gets called everytime the checkbox is clicked.
                             * We check if the key is in the array already, add if not, delete if yes.
                             */
                            let tempArray = this.state.selectedIds;

                            if (this.state.selectedIds.indexOf(account.id) !== -1) {
                              tempArray.splice(this.state.selectedIds.indexOf(account.id), 1);
                            } else {
                              tempArray.push(account.id);
                            }

                            this.setState({
                              selectedIds: tempArray
                            });
                          }}
                        />
                      </label>
                    </div></th>
                    <td>{account.accountName}</td>
                    <td>{account.accountNumber}</td>
                    <td>{account.clientName}</td>
                    <td>{account.matterTitle}</td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>
        <form className="col-xs-12 col-sm-3 form-horizontal" onSubmit={this.state.editMode ? this.handleEdit : this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="inputAccountName">Account Name</label>
            <input type="text" className="form-control" id="inputAccountName" name="accountName"
                   onChange={this.handleChange} value={this.state.accountName} />
          </div>
          <div className="form-group">
            <label htmlFor="inputAccountNumber">Account Number</label>
            <input type="text" className="form-control" id="inputAccountNumber" name="accountNumber"
                   onChange={this.handleChange} value={this.state.accountNumber} />
          </div>
          <div className="form-group">
            <label htmlFor="inputClientName">Client Name</label>
            <input type="text" className="form-control" id="inputClientName" name="clientName"
                   onChange={this.handleChange} value={this.state.clientName} />
          </div>
          <div className="form-group">
            <label htmlFor="inputMatterTitle">Matter Title</label>
            <input type="text" className="form-control" id="inputMatterTitle" name="matterTitle"
                   onChange={this.handleChange} value={this.state.matterTitle} />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-default">
              { this.state.editMode ? "Save" : "Submit" }</button>
          </div>
        </form>

        <style jsx>{`
          .buttons { margin-bottom: 1em; }
          .buttons .btn { margin-right: 10px; }
        `}</style>
      </div>
    )
  }
}

export default AccountsTab;
