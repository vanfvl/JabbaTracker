import React, { Component } from 'react';
import SortTypes from './DataTable/sortTypes';
import { Table, Column, Cell } from 'fixed-data-table-2';
import DataListWrapper from './DataTable/dataListWrapper';
import DataWrapper from './DataTable/dataWrapper';
import SortHeaderCell from './DataTable/sortHeaderCell';
import { TextCell } from './DataTable/cells';
import moment from 'moment';
import { firebase } from '../firebase';
import Autocomplete from 'react-autocomplete';

export default class TableTime extends Component {
  constructor(props) {
    super(props);

    this._dataList = new DataWrapper(props.entries);

    this._defaultSortIndexes = [];
    var size = this._dataList.getSize();
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    this.state = {
      sortedDataList: this._dataList,
      colSortDirs: {},
      selectedIds: [],
      accounts: [],
      editItem: {
        entryId: '',
        year: '',
        month: '',
        day: '',
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
      }
    };

    this._onSortChange = this._onSortChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.entries !== this.props.entries) {
      this.initializeData();
    }
  }

  handleChange(e) {
    const { editItem } = this.state;

    editItem[e.target.name] = e.target.value;

    this.setState({
      editItem
    });
  }

  initializeData() {
    this._dataList = new DataWrapper(this.props.entries);
    this._defaultSortIndexes = [];
    let size = this._dataList.getSize();
    for (let index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    const items = this.props.accounts;
    const accounts = [];

    for (let key in items) {
      let item = {
        id: key,
        ...items[key],
      };

      accounts.push(item);
    }

    this.setState({
      sortedDataList: this._dataList,
      colSortDirs: {},
      accounts
    });
  }

  filterData(notLogged = false) {
    this._dataList = new DataWrapper(notLogged ? this.props.entries.filter(entry => !entry.logged) : this.props.entries);

    this._defaultSortIndexes = [];
    var size = this._dataList.getSize();
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    this.setState({
      sortedDataList: this._dataList,
      colSortDirs: {},
      selectedIds: []
    });
  }

  _onSortChange(columnKey, sortDir) {
    var sortIndexes = this._defaultSortIndexes.slice();
    sortIndexes.sort((indexA, indexB) => {
      var valueA = this._dataList.getObjectAt(indexA)[columnKey];
      var valueB = this._dataList.getObjectAt(indexB)[columnKey];

      if (columnKey === 'logged') {
        valueA = !!this._dataList.getObjectAt(indexA)[columnKey];
        valueB = !!this._dataList.getObjectAt(indexB)[columnKey];
      }

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

  logEntries(logged = true) {
    if (this.state.selectedIds.length === 0) return false;

    this.state.selectedIds.forEach(id => {
      const ref = firebase.database().ref(`entries/${id}`);
      const entry = this.props.entries.find(item => item.id === id);

      if (entry) {
        ref.set({
          account: entry.account,
          // createdAt: entry.createdAt,
          // createdBy: entry.createdBy,
          date: entry.date,
          description: entry.description,
          duration: entry.duration,
          logged: logged ? new Date().getTime() : false
        });
      }
    });
  }

  deleteEntries() {
    if (this.state.selectedIds.length === 0) return false;

    this.state.selectedIds.forEach(id => firebase.database().ref(`entries/${id}`).remove());

    this.setState({
      selectedIds: []
    });
  }

  editItem() {
    const entryId = this.state.selectedIds[0];
    if (!entryId) return false;

    const entry = this.props.entries.find( entry => entry.id === entryId );
    if (!entry) return false;

    const account = this.props.accounts[entry.account];
    if (!account) return false;

    account.id = entry.account;

    this.setState({
      editItem: {
        entryId: entryId,
        year: new Date(entry.date).getFullYear(),
        month: new Date(entry.date).getMonth() + 1,
        day: new Date(entry.date).getDate(),
        errorDate: '',
        accountName: account.accountName,
        account: account,
        errorAccountName: '',
        hour: new Date(entry.date).getHours(),
        min: new Date(entry.date).getMinutes(),
        errorTime: '',
        duration1: entry.duration.split('.')[0],
        duration2: entry.duration.split('.')[1],
        errorDuration: '',
        description: entry.description,
        errorDescription: ''
      }
    }, () => {
      $('#editModal').modal('show');
    });
  }

  handleEdit() {
    const { editItem } = this.state;
    let hasError = false;

    editItem.errorDate = '';
    editItem.errorAccountName = '';
    editItem.errorTime = '';
    editItem.errorDuration = '';
    editItem.errorDescription = '';

    if ( editItem.month === '' || editItem.day === '' ) {
      editItem.errorDate = 'Please enter a valid date.';
      hasError = true;
    }

    if ( !editItem.account ) {
      editItem.errorAccountName = 'Please select a valid account.';
      hasError = true;
    }

    if ( editItem.hour === '' || editItem.min === '' ) {
      editItem.errorTime = 'Please enter a valid time.';
      hasError = true;
    }

    if ( editItem.duration1 === '' && editItem.duration2 === '' ) {
      editItem.errorDuration = 'Please enter a valid duration.';
      hasError = true;
    }

    if ( editItem.description === '' ) {
      editItem.errorDescription = 'Please enter a description.';
      hasError = true;
    }

    if (hasError) return false;

    if (hasError) {
      this.setState({editItem});
      return false;
    }

    const entry = {
      account: editItem.account.id,
      date: new Date(editItem.year || '2017', editItem.month - 1, editItem.day, editItem.hour, editItem.min).getTime(),
      description: editItem.description,
      duration: `${editItem.duration1 || 0}.${editItem.duration2 || 0}`,
      logged: false
    };

    const ref = firebase.database().ref(`entries/${editItem.entryId}`);
    ref.set(entry, () => {
      $('#editModal').modal('hide');
    });
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

  findAccountByName(accountName) {
    return this.state.accounts.find((item) => item.accountName === accountName);
  }

  filterTable(e) {
    this._dataList = new DataWrapper(e.target.value ? this.props.entries.filter(entry => entry.account === e.target.value) : this.props.entries);

    this._defaultSortIndexes = [];
    var size = this._dataList.getSize();
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    this.setState({
      sortedDataList: this._dataList,
      colSortDirs: {},
      selectedIds: []
    });
  }

  render() {
    const {sortedDataList, colSortDirs} = this.state;

    const changeAccount = (value) => {
      const {editItem} = this.state;

      editItem.accountName = value;
      editItem.account = this.findAccountByName(value);

      return editItem;
    };

    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-default"
                onClick={() => this.logEntries(true)}
              >
                Log
              </button>
              <button
                type="button"
                className="btn btn-default"
                onClick={() => this.logEntries(false)}
              >
                Unlog
              </button>
            </div>
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-default"
                onClick={() => this.editItem()}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-default"
                onClick={() => this.deleteEntries()}
              >
                Delete
              </button>
            </div>
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-default"
                onClick={() => this.filterData(false)}
              >
                View All
              </button>
              <button
                type="button"
                className="btn btn-default"
                onClick={() => this.filterData(true)}
              >
                View Not Logged
              </button>
            </div>

            <div className="btn-group form-inline" role="group">
              Account Filter:
              <select
                className="form-control"
                style={{marginLeft: 5}}
                onChange={(e) => this.filterTable(e)}
              >
                <option value="">-- All --</option>
                { this.state.accounts &&
                  this.state.accounts.sort((a,b) => {
                    if (a.accountName.toUpperCase() < b.accountName.toUpperCase()) return -1;
                    if (a.accountName.toUpperCase() > b.accountName.toUpperCase()) return 1;
                    return 0;
                  }).map(account => (
                    <option value={account.id} key={account.id}>{account.accountName}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>

        <Table
          rowHeight={50}
          rowsCount={sortedDataList.getSize()}
          headerHeight={50}
          width={document.querySelector('.container').offsetWidth - 30}
          height={window.innerHeight - 170}
          onRowClick={(data, index) => {
            /*
             * onChange gets called everytime the checkbox is clicked.
             * We check if the key is in the array already, add if not, delete if yes.
             */
            let tempArray = this.state.selectedIds;
            const item = sortedDataList.getObjectAt(index);

            if (this.state.selectedIds.indexOf(item.id) !== -1) {
              tempArray.splice(this.state.selectedIds.indexOf(item.id), 1);
            } else {
              tempArray.push(item.id);
            }

            this.setState({
              selectedIds: tempArray
            });
          }}
          {...this.props}>
          <Column
            columnKey="id"
            cell={({rowIndex, ...props}) => (
              <Cell
                {...props}
              >
                <input
                  type="checkbox"
                  checked={this.state.selectedIds.indexOf(sortedDataList.getObjectAt(rowIndex).id) !== -1}
                />
              </Cell>
            )}
            width={30}
          />
          <Column
            columnKey="accountName"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.accountName}>
                Account
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={100}
          />
          <Column
            columnKey="clientName"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.clientName}>
                Client Name
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={200}
          />
          <Column
            columnKey="matterTitle"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.matterTitle}>
                Matter Title
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={200}
          />
          <Column
            columnKey="date"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.date}>
                Date
              </SortHeaderCell>
            }
            cell={({rowIndex, ...props}) => (
              <Cell
                {...props}
              >
                {moment(new Date(sortedDataList.getObjectAt(rowIndex).date)).format('MMM D, YYYY')}
              </Cell>
            )}
            width={120}
          />
          <Column
            columnKey="time"
            header={
              <Cell>
                Time
              </Cell>
            }
            cell={({rowIndex, ...props}) => (
              <Cell
                {...props}
              >
                {moment(new Date(sortedDataList.getObjectAt(rowIndex).date)).format('h:mma')}
              </Cell>
            )}
            width={80}
          />
          <Column
            columnKey="duration"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.duration}>
                Duration
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={80}
          />
          <Column
            columnKey="description"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.description}>
                Description
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={200}
            flexGrow={1}
          />
          <Column
            columnKey="logged"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.logged}>
                Status
              </SortHeaderCell>
            }
            cell={({rowIndex, ...props}) => (
              <Cell
                style={{ backgroundColor: sortedDataList.getObjectAt(rowIndex).logged ? '#D6FFAA' : '' }}
                {...props}
              >
                {sortedDataList.getObjectAt(rowIndex).logged ? 'Logged' : 'Not Logged'}
              </Cell>
            )}
            width={80}
          />
        </Table>

        <div className="modal fade" id="editModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title" id="myModalLabel">Edit Entry</h4>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="year">Date</label>
                    <input type="text" id="year" name="year" className="form-control year" placeholder="2017"
                           value={this.state.editItem.year} onChange={(e) => this.handleChange(e)}/>
                    <input type="text" name="month" className="form-control month" placeholder="MM"
                           value={this.state.editItem.month} onChange={(e) => this.handleChange(e)}/>
                    <input type="text" name="day" className="form-control day" placeholder="DD"
                           value={this.state.editItem.day} onChange={(e) => this.handleChange(e)}/>
                    { this.state.editItem.errorDate &&
                    <span className="help-block">{this.state.editItem.errorDate}</span>
                    }
                  </div>
                  <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="account">Account</label>
                    <Autocomplete
                      getItemValue={(item) => item.accountName}
                      inputProps={{className: 'form-control', id: 'account'}}
                      wrapperStyle={{width: '100%', display: 'inline-block'}}
                      items={this.state.accounts}
                      renderItem={(item, isHighlighted) =>
                        <div style={{background: isHighlighted ? 'lightgray' : 'white'}}>
                          { item.accountName }
                        </div>
                      }
                      value={this.state.editItem.accountName}
                      shouldItemRender={this.matchStateToTerm}
                      sortItems={this.sortResults}
                      onChange={(e, value) => this.setState({editItem: changeAccount(value)}) }
                      onSelect={(value) => this.setState({editItem: changeAccount(value)}) }
                    />
                    { this.state.editItem.errorAccountName &&
                    <span className="help-block">{this.state.editItem.errorAccountName}</span>
                    }
                  </div>
                  <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="hour">Time</label>
                    <input type="text" name="hour" className="form-control time" placeholder="00"
                           value={this.state.editItem.hour} onChange={(e) => this.handleChange(e)}/>:
                    <input type="text" name="min" className="form-control time" placeholder="00"
                           value={this.state.editItem.min} onChange={(e) => this.handleChange(e)}/>
                    { this.state.editItem.errorTime &&
                    <span className="help-block">{this.state.editItem.errorTime}</span>
                    }
                  </div>
                  <div className="form-group col-xs-12 col-sm-6">
                    <label htmlFor="duration1">Duration</label>
                    <input type="text" name="duration1" className="form-control duration" placeholder="0"
                           value={this.state.editItem.duration1} onChange={(e) => this.handleChange(e)}/>.
                    <input type="text" name="duration2" className="form-control duration" placeholder="00"
                           value={this.state.editItem.duration2} onChange={(e) => this.handleChange(e)}/>
                    { this.state.editItem.errorDuration &&
                    <span className="help-block">{this.state.editItem.errorDuration}</span>
                    }
                  </div>
                  <div className="form-group col-xs-12 col-sm-12">
                    <label htmlFor="description">Description</label>
                    <input type="text" name="description" className="form-control description" placeholder="Description"
                           value={this.state.editItem.description} onChange={(e) => this.handleChange(e)} />
                    { this.state.editItem.errorDescription &&
                    <span className="help-block">{this.state.editItem.errorDescription}</span>
                    }
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-primary" onClick={() => this.handleEdit()}>Save</button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .row { margin-bottom: 1em; }
          .btn-group { margin-right: 1em; }

          label {
            display: block;
          }

          .year {
            width: 60px;
            margin-right: 2px;
            display: inline-block;
          }

          .month {
            width: 50px;
            margin-right: 2px;
            display: inline-block;
          }

          .day {
            width: 50px;
            margin-right: 2px;
            display: inline-block;
          }

          .time, .duration {
            width: 48%;
            text-align: right;
            display: inline-block;
          }

          .time:last-child, .duration:last-child {
            margin-right: 0;
            text-align: left;
          }
        `}</style>
      </div>
    );
  }
}
