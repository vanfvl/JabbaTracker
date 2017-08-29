import React, { Component } from 'react';
import SortTypes from './DataTable/sortTypes';
import { Table, Column, Cell } from 'fixed-data-table-2';
import DataListWrapper from './DataTable/dataListWrapper';
import DataWrapper from './DataTable/dataWrapper';
import SortHeaderCell from './DataTable/sortHeaderCell';
import { TextCell } from './DataTable/cells';
import moment from 'moment';

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
      selectedIds: []
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

    this.setState({
      sortedDataList: this._dataList,
      colSortDirs: {},
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

  render() {
    var {sortedDataList, colSortDirs} = this.state;
    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <div className="btn-group" role="group">
              <button type="button" className="btn btn-default">Log</button>
              <button type="button" className="btn btn-default">Unlog</button>
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
            columnKey="matterName"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.matterName}>
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
                {...props}
              >
                {sortedDataList.getObjectAt(rowIndex).logged ? 'Logged' : 'Not Logged'}
              </Cell>
            )}
            width={80}
          />
        </Table>

        <style jsx>{`
          .row { margin-bottom: 1em; }
          .btn-group { margin-right: 1em; }
        `}</style>
      </div>
    );
  }
}
