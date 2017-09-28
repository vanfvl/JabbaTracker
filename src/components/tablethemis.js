import React, { Component } from 'react';
import SortTypes from './DataTable/sortTypes';
import { Table, Column, Cell } from 'fixed-data-table-2';
import DataListWrapper from './DataTable/dataListWrapper';
import DataWrapper from './DataTable/dataWrapper';
import SortHeaderCell from './DataTable/sortHeaderCell';
import { TextCell } from './DataTable/cells';
import moment from 'moment';
import { firebase } from '../firebase';
import CopyToClipboard from 'react-copy-to-clipboard';
import Snackbar from 'material-ui/Snackbar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

export default class TableThemis extends Component {
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
      copied: false,
    };

    this._onSortChange = this._onSortChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.entries !== this.props.entries) {
      this.initializeData();
    }
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

  handleRequestClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ copied: false });
  };

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
    var {sortedDataList, colSortDirs} = this.state;
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
            columnKey="accountNumber"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.accountNumber}>
                Account #
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={100}
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
            cell={({rowIndex, ...props}) => (
              <Cell
                {...props}
              >
                <CopyToClipboard text={sortedDataList.getObjectAt(rowIndex).description} onCopy={() => this.setState({copied: true})}>
                  <span style={{display: 'block'}}>{sortedDataList.getObjectAt(rowIndex).description}</span>
                </CopyToClipboard>
              </Cell>
            )}
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

        <MuiThemeProvider>
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={this.state.copied}
            autoHideDuration={3e3}
            onRequestClose={this.handleRequestClose}
            SnackbarContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">Copied to clipboard.</span>}
          />
        </MuiThemeProvider>

        <style jsx>{`
          .row { margin-bottom: 1em; }
          .btn-group { margin-right: 1em; }
        `}</style>
      </div>
    );
  }
}
