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
    };

    this._onSortChange = this._onSortChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.entries !== this.props.entries) {
      this._dataList = new DataWrapper(this.props.entries);
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

  render() {
    var {sortedDataList, colSortDirs} = this.state;
    return (
      <Table
        rowHeight={50}
        rowsCount={sortedDataList.getSize()}
        headerHeight={50}
        width={1000}
        height={500}
        {...this.props}>
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
          width={200}
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
        />
      </Table>
    );
  }
}
