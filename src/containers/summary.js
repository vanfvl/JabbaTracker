import React, {Component} from 'react';
import {Route, IndexRoute} from 'react-router-dom';
import { firebase } from '../firebase';
import moment from 'moment';

import SortTypes from '../components/DataTable/sortTypes';
import { Table, Column, Cell } from 'fixed-data-table-2';
import DataListWrapper from '../components/DataTable/dataListWrapper';
import DataWrapper from '../components/DataTable/dataWrapper';
import SortHeaderCell from '../components/DataTable/sortHeaderCell';
import { TextCell } from '../components/DataTable/cells';

class SummaryTab extends Component {
  constructor(props) {
    super(props);

	  this._dataList = new DataWrapper([]);
	  this._defaultSortIndexes = [];

    this.state = {
	    sortedDataList: this._dataList,
	    colSortDirs: {},
      entries: [],
      accounts: []
    };

    this.entriesRef = firebase.database().ref('entries');
    this.accountsRef = firebase.database().ref('accounts');

	  this._onSortChange = this._onSortChange.bind(this);
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

			this._dataList = new DataWrapper(this.computeData());
			this._defaultSortIndexes = [];
			let size = this._dataList.getSize();
			for (let index = 0; index < size; index++) {
				this._defaultSortIndexes.push(index);
			}

			this.setState({sortedDataList: this._dataList});
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

			this._dataList = new DataWrapper(this.computeData());
			this._defaultSortIndexes = [];
			let size = this._dataList.getSize();
			for (let index = 0; index < size; index++) {
				this._defaultSortIndexes.push(index);
			}

			this.setState({sortedDataList: this._dataList});
		});
	}

	componentWillUnmount() {
		this.entriesRef.off();
		this.accountsRef.off();
	}

	_onSortChange(columnKey, sortDir) {
		let sortIndexes = this._defaultSortIndexes.slice();
		sortIndexes.sort((indexA, indexB) => {
			let valueA = parseFloat(this._dataList.getObjectAt(indexA)[columnKey]);
			let valueB = parseFloat(this._dataList.getObjectAt(indexB)[columnKey]);

			if (columnKey === 'accountName' || columnKey === 'dateLastLogged') {
				valueA = this._dataList.getObjectAt(indexA)[columnKey];
				valueB = this._dataList.getObjectAt(indexB)[columnKey];
			}

			let sortVal = 0;
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

  computeData() {
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
	  const data = [];

	  for (let entry in accountsTotal) {
	    data.push({
        accountName: accountsTotal[entry].accountName,
        totalDuration: parseFloat(Math.round(accountsTotal[entry].totalDuration * 100) / 100).toFixed(2),
        durationLogged: parseFloat(Math.round(accountsTotal[entry].durationLogged * 100) / 100).toFixed(2),
        durationNotLogged: parseFloat(Math.round(accountsTotal[entry].durationNotLogged * 100) / 100).toFixed(2),
        dateLastLogged: accountsTotal[entry].dateLastLogged ? accountsTotal[entry].dateLastLogged : false
      });
	  }

	  return data;
  }

  renderTable() {
	  const {sortedDataList, colSortDirs} = this.state;

	  return (
		  <Table
			  rowHeight={50}
			  rowsCount={sortedDataList.getSize()}
			  headerHeight={50}
			  width={document.querySelector('.container').offsetWidth - (document.querySelector('.account-summary') ? document.querySelector('.account-summary').offsetWidth : 0) - 30}
			  height={window.innerHeight - 170}
			  {...this.props}>
			  <Column
				  columnKey="accountName"
				  header={
					  <SortHeaderCell
						  onSortChange={this._onSortChange}
						  sortDir={colSortDirs.accountName}>
						  Account Name
					  </SortHeaderCell>
				  }
				  cell={<TextCell data={sortedDataList} />}
				  width={200}
				  flexGrow={1}
			  />
			  <Column
				  columnKey="totalDuration"
				  header={
					  <SortHeaderCell
						  onSortChange={this._onSortChange}
						  sortDir={colSortDirs.totalDuration}>
						  Total Duration
					  </SortHeaderCell>
				  }
				  cell={<TextCell data={sortedDataList} />}
				  width={100}
			  />
			  <Column
				  columnKey="durationLogged"
				  header={
					  <SortHeaderCell
						  onSortChange={this._onSortChange}
						  sortDir={colSortDirs.durationLogged}>
						  Duration Logged
					  </SortHeaderCell>
				  }
				  cell={<TextCell data={sortedDataList} />}
				  width={100}
			  />
			  <Column
				  columnKey="durationNotLogged"
				  header={
					  <SortHeaderCell
						  onSortChange={this._onSortChange}
						  sortDir={colSortDirs.durationNotLogged}>
						  Duration Not Logged
					  </SortHeaderCell>
				  }
				  cell={<TextCell data={sortedDataList} />}
				  width={100}
			  />
			  <Column
				  columnKey="dateLastLogged"
				  header={
					  <SortHeaderCell
						  onSortChange={this._onSortChange}
						  sortDir={colSortDirs.dateLastLogged}>
						  Date Last Logged
					  </SortHeaderCell>
				  }
				  cell={({rowIndex, ...props}) => (
					  <Cell
						  {...props}
					  >
						  {sortedDataList.getObjectAt(rowIndex).dateLastLogged ? moment(new Date(sortedDataList.getObjectAt(rowIndex).dateLastLogged)).format('MMM D, YYYY - HH:MMa') : 'N/A'}
					  </Cell>
				  )}
				  width={200}
				  flexGrow={1}
			  />
		  </Table>
    );
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-12 col-sm-8">
          {this.renderTable()}
        </div>
        <div className="col-xs-12 col-sm-4 account-summary">
          <table className="table table-bordered col-xs-12 col-sm-4">
            {this.accountsSummary()}
          </table>
        </div>
      </div>
    )
  }
}

export default SummaryTab;
