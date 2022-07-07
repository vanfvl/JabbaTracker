import React, { Fragment, Component } from 'react'
import SortTypes from './DataTable/sortTypes'
import { Table, Column, Cell } from 'fixed-data-table-2'
import DataListWrapper from './DataTable/dataListWrapper'
import DataWrapper from './DataTable/dataWrapper'
import SortHeaderCell from './DataTable/sortHeaderCell'
import { TextCell } from './DataTable/cells'
import moment from 'moment'
import { firebase } from '../firebase'
import Autocomplete from 'react-autocomplete'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon, XIcon } from '@heroicons/react/outline'

export default class TableTime extends Component {
  constructor(props) {
    super(props)

    this._dataList = new DataWrapper(props.entries)

    this._defaultSortIndexes = []
    var size = this._dataList.getSize()
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index)
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
      },
      open: false
    }

    this._onSortChange = this._onSortChange.bind(this)
    this.cancelButtonRef = undefined
  }

  componentDidUpdate(prevProps) {
    if (prevProps.entries !== this.props.entries) {
      this.initializeData()
    }
  }

  setOpen = (open) => {
    this.setState({ open })
  }

  handleChange(e) {
    const { editItem } = this.state

    editItem[e.target.name] = e.target.value

    this.setState({
      editItem
    })
  }

  initializeData() {
    this._dataList = new DataWrapper(this.props.entries)
    this._defaultSortIndexes = []
    let size = this._dataList.getSize()
    for (let index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index)
    }

    const items = this.props.accounts
    const accounts = []

    for (let key in items) {
      let item = {
        id: key,
        ...items[key]
      }

      accounts.push(item)
    }

    this.setState({
      sortedDataList: this._dataList,
      colSortDirs: {},
      accounts
    })
  }

  filterData(notLogged = false) {
    this._dataList = new DataWrapper(
      notLogged ? this.props.entries.filter((entry) => !entry.logged) : this.props.entries
    )

    this._defaultSortIndexes = []
    var size = this._dataList.getSize()
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index)
    }

    this.setState({
      sortedDataList: this._dataList,
      colSortDirs: {},
      selectedIds: []
    })
  }

  _onSortChange(columnKey, sortDir) {
    var sortIndexes = this._defaultSortIndexes.slice()
    sortIndexes.sort((indexA, indexB) => {
      var valueA = this._dataList.getObjectAt(indexA)[columnKey]
      var valueB = this._dataList.getObjectAt(indexB)[columnKey]

      if (columnKey === 'logged') {
        valueA = !!this._dataList.getObjectAt(indexA)[columnKey]
        valueB = !!this._dataList.getObjectAt(indexB)[columnKey]
      }

      var sortVal = 0
      if (valueA > valueB) {
        sortVal = 1
      }
      if (valueA < valueB) {
        sortVal = -1
      }
      if (sortVal !== 0 && sortDir === SortTypes.ASC) {
        sortVal = sortVal * -1
      }

      return sortVal
    })

    this.setState({
      sortedDataList: new DataListWrapper(sortIndexes, this._dataList),
      colSortDirs: {
        [columnKey]: sortDir
      }
    })
  }

  logEntries(logged = true) {
    if (this.state.selectedIds.length === 0) return false

    this.state.selectedIds.forEach((id) => {
      const ref = firebase.database().ref(`entries/${id}`)
      const entry = this.props.entries.find((item) => item.id === id)

      if (entry) {
        ref.set({
          account: entry.account,
          // createdAt: entry.createdAt,
          // createdBy: entry.createdBy,
          date: entry.date,
          description: entry.description,
          duration: entry.duration,
          logged: logged ? new Date().getTime() : false
        })
      }
    })
  }

  deleteEntries() {
    if (this.state.selectedIds.length === 0) return false

    this.state.selectedIds.forEach((id) => firebase.database().ref(`entries/${id}`).remove())

    this.setState({
      selectedIds: []
    })
  }

  editItem() {
    const entryId = this.state.selectedIds[0]
    if (!entryId) return false

    const entry = this.props.entries.find((entry) => entry.id === entryId)
    if (!entry) return false

    const account = this.props.accounts[entry.account]
    if (!account) return false

    account.id = entry.account

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
      },
      open: true
    })
  }

  handleEdit() {
    const { editItem } = this.state
    let hasError = false

    editItem.errorDate = ''
    editItem.errorAccountName = ''
    editItem.errorTime = ''
    editItem.errorDuration = ''
    editItem.errorDescription = ''

    if (editItem.month === '' || editItem.day === '') {
      editItem.errorDate = 'Please enter a valid date.'
      hasError = true
    }

    if (!editItem.account) {
      editItem.errorAccountName = 'Please select a valid account.'
      hasError = true
    }

    if (editItem.hour === '' || editItem.min === '') {
      editItem.errorTime = 'Please enter a valid time.'
      hasError = true
    }

    if (editItem.duration1 === '' && editItem.duration2 === '') {
      editItem.errorDuration = 'Please enter a valid duration.'
      hasError = true
    }

    if (editItem.description === '') {
      editItem.errorDescription = 'Please enter a description.'
      hasError = true
    }

    if (hasError) return false

    if (hasError) {
      this.setState({ editItem })
      return false
    }

    const entry = {
      account: editItem.account.id,
      date: new Date(
        editItem.year || '2017',
        editItem.month - 1,
        editItem.day,
        editItem.hour,
        editItem.min
      ).getTime(),
      description: editItem.description,
      duration: `${editItem.duration1 || 0}.${editItem.duration2 || 0}`,
      logged: false
    }

    const ref = firebase.database().ref(`entries/${editItem.entryId}`)
    ref.set(entry, () => {
      this.setState({ open: false })
    })
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

  findAccountByName(accountName) {
    return this.state.accounts.find((item) => item.accountName === accountName)
  }

  filterTable(e) {
    this._dataList = new DataWrapper(
      e.target.value
        ? this.props.entries.filter((entry) => entry.account === e.target.value)
        : this.props.entries
    )

    this._defaultSortIndexes = []
    var size = this._dataList.getSize()
    for (var index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index)
    }

    this.setState({
      sortedDataList: this._dataList,
      colSortDirs: {},
      selectedIds: []
    })
  }

  render() {
    const { sortedDataList, colSortDirs } = this.state

    const changeAccount = (value) => {
      const { editItem } = this.state

      editItem.accountName = value
      editItem.account = this.findAccountByName(value)

      return editItem
    }

    return (
      <div className="flex flex-col">
        <div className="relative z-0 inline-flex rounded-md mb-4">
          <button
            type="button"
            className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => this.logEntries(true)}
          >
            Log
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => this.logEntries(false)}
          >
            Unlog
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => this.editItem()}
          >
            Edit
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => this.deleteEntries()}
          >
            Delete
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => this.filterData(false)}
          >
            View All
          </button>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => this.filterData(true)}
          >
            View Not Logged
          </button>

          <div className="ml-5 flex items-center" role="group">
            Account Filter:
            <select
              className="form-control h-full"
              style={{ marginLeft: 5 }}
              onChange={(e) => this.filterTable(e)}
            >
              <option value="">-- All --</option>
              {this.state.accounts &&
                this.state.accounts
                  .sort((a, b) => {
                    if (a.accountName.toUpperCase() < b.accountName.toUpperCase()) return -1
                    if (a.accountName.toUpperCase() > b.accountName.toUpperCase()) return 1
                    return 0
                  })
                  .map((account) => (
                    <option value={account.id} key={account.id}>
                      {account.accountName}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        <Table
          rowHeight={50}
          rowsCount={sortedDataList.getSize()}
          headerHeight={50}
          width={document.querySelector('.app-container').offsetWidth - 30}
          height={window.innerHeight - 170}
          onRowClick={(data, index) => {
            /*
             * onChange gets called everytime the checkbox is clicked.
             * We check if the key is in the array already, add if not, delete if yes.
             */
            let tempArray = this.state.selectedIds
            const item = sortedDataList.getObjectAt(index)

            if (this.state.selectedIds.indexOf(item.id) !== -1) {
              tempArray.splice(this.state.selectedIds.indexOf(item.id), 1)
            } else {
              tempArray.push(item.id)
            }

            this.setState({
              selectedIds: tempArray
            })
          }}
          {...this.props}
        >
          <Column
            columnKey="id"
            cell={({ rowIndex, ...props }) => (
              <Cell {...props}>
                <input
                  type="checkbox"
                  defaultChecked={
                    this.state.selectedIds.indexOf(sortedDataList.getObjectAt(rowIndex).id) !== -1
                  }
                />
              </Cell>
            )}
            width={30}
          />
          <Column
            columnKey="accountName"
            header={
              <SortHeaderCell onSortChange={this._onSortChange} sortDir={colSortDirs.accountName}>
                Account
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={100}
          />
          <Column
            columnKey="clientName"
            header={
              <SortHeaderCell onSortChange={this._onSortChange} sortDir={colSortDirs.clientName}>
                Client Name
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={200}
          />
          <Column
            columnKey="matterTitle"
            header={
              <SortHeaderCell onSortChange={this._onSortChange} sortDir={colSortDirs.matterTitle}>
                Matter Title
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={200}
          />
          <Column
            columnKey="date"
            header={
              <SortHeaderCell onSortChange={this._onSortChange} sortDir={colSortDirs.date}>
                Date
              </SortHeaderCell>
            }
            cell={({ rowIndex, ...props }) => (
              <Cell {...props}>
                {moment(new Date(sortedDataList.getObjectAt(rowIndex).date)).format('MMM D, YYYY')}
              </Cell>
            )}
            width={120}
          />
          <Column
            columnKey="time"
            header={<Cell>Time</Cell>}
            cell={({ rowIndex, ...props }) => (
              <Cell {...props}>
                {moment(new Date(sortedDataList.getObjectAt(rowIndex).date)).format('h:mma')}
              </Cell>
            )}
            width={80}
          />
          <Column
            columnKey="duration"
            header={
              <SortHeaderCell onSortChange={this._onSortChange} sortDir={colSortDirs.duration}>
                Duration
              </SortHeaderCell>
            }
            cell={<TextCell data={sortedDataList} />}
            width={80}
          />
          <Column
            columnKey="description"
            header={
              <SortHeaderCell onSortChange={this._onSortChange} sortDir={colSortDirs.description}>
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
              <SortHeaderCell onSortChange={this._onSortChange} sortDir={colSortDirs.logged}>
                Status
              </SortHeaderCell>
            }
            cell={({ rowIndex, ...props }) => (
              <Cell
                style={{
                  backgroundColor: sortedDataList.getObjectAt(rowIndex).logged ? '#D6FFAA' : ''
                }}
                {...props}
              >
                {sortedDataList.getObjectAt(rowIndex).logged ? 'Logged' : 'Not Logged'}
              </Cell>
            )}
            width={80}
          />
        </Table>

        <Transition.Root show={this.state.open} as={Fragment}>
          <Dialog
            as="div"
            className="fixed z-10 inset-0 overflow-y-auto"
            initialFocus={this.cancelButtonRef}
            onClose={this.setOpen}
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => this.setOpen(false)}
                      >
                        <span className="sr-only">Close</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg leading-6 font-medium text-gray-900"
                        >
                          Edit Entry
                        </Dialog.Title>
                        <div className="mt-2">
                          <div className="modal-dialog" role="document">
                            <div className="modal-content">
                              <div className="modal-header">
                                <button
                                  type="button"
                                  className="close"
                                  data-dismiss="modal"
                                  aria-label="Close"
                                >
                                  <span aria-hidden="true">&times;</span>
                                </button>
                                <h4 className="modal-title" id="myModalLabel">
                                  Edit Entry
                                </h4>
                              </div>
                              <div className="modal-body">
                                <div className="row">
                                  <div className="form-group col-xs-12 col-sm-6">
                                    <label htmlFor="year">Date</label>
                                    <input
                                      type="text"
                                      id="year"
                                      name="year"
                                      className="form-control year"
                                      placeholder="2017"
                                      value={this.state.editItem.year}
                                      onChange={(e) => this.handleChange(e)}
                                    />
                                    <input
                                      type="text"
                                      name="month"
                                      className="form-control month"
                                      placeholder="MM"
                                      value={this.state.editItem.month}
                                      onChange={(e) => this.handleChange(e)}
                                    />
                                    <input
                                      type="text"
                                      name="day"
                                      className="form-control day"
                                      placeholder="DD"
                                      value={this.state.editItem.day}
                                      onChange={(e) => this.handleChange(e)}
                                    />
                                    {this.state.editItem.errorDate && (
                                      <span className="help-block">
                                        {this.state.editItem.errorDate}
                                      </span>
                                    )}
                                  </div>
                                  <div className="form-group col-xs-12 col-sm-6">
                                    <label htmlFor="account">Account</label>
                                    <Autocomplete
                                      getItemValue={(item) => item.accountName}
                                      inputProps={{ className: 'form-control', id: 'account' }}
                                      wrapperStyle={{ width: '100%', display: 'inline-block' }}
                                      items={this.state.accounts}
                                      renderItem={(item, isHighlighted) => (
                                        <div
                                          style={{
                                            background: isHighlighted ? 'lightgray' : 'white'
                                          }}
                                        >
                                          {item.accountName}
                                        </div>
                                      )}
                                      value={this.state.editItem.accountName}
                                      shouldItemRender={this.matchStateToTerm}
                                      sortItems={this.sortResults}
                                      onChange={(e, value) =>
                                        this.setState({ editItem: changeAccount(value) })
                                      }
                                      onSelect={(value) =>
                                        this.setState({ editItem: changeAccount(value) })
                                      }
                                    />
                                    {this.state.editItem.errorAccountName && (
                                      <span className="help-block">
                                        {this.state.editItem.errorAccountName}
                                      </span>
                                    )}
                                  </div>
                                  <div className="form-group col-xs-12 col-sm-6">
                                    <label htmlFor="hour">Time</label>
                                    <input
                                      type="text"
                                      name="hour"
                                      className="form-control time"
                                      placeholder="00"
                                      value={this.state.editItem.hour}
                                      onChange={(e) => this.handleChange(e)}
                                    />
                                    :
                                    <input
                                      type="text"
                                      name="min"
                                      className="form-control time"
                                      placeholder="00"
                                      value={this.state.editItem.min}
                                      onChange={(e) => this.handleChange(e)}
                                    />
                                    {this.state.editItem.errorTime && (
                                      <span className="help-block">
                                        {this.state.editItem.errorTime}
                                      </span>
                                    )}
                                  </div>
                                  <div className="form-group col-xs-12 col-sm-6">
                                    <label htmlFor="duration1">Duration</label>
                                    <input
                                      type="text"
                                      name="duration1"
                                      className="form-control duration"
                                      placeholder="0"
                                      value={this.state.editItem.duration1}
                                      onChange={(e) => this.handleChange(e)}
                                    />
                                    .
                                    <input
                                      type="text"
                                      name="duration2"
                                      className="form-control duration"
                                      placeholder="00"
                                      value={this.state.editItem.duration2}
                                      onChange={(e) => this.handleChange(e)}
                                    />
                                    {this.state.editItem.errorDuration && (
                                      <span className="help-block">
                                        {this.state.editItem.errorDuration}
                                      </span>
                                    )}
                                  </div>
                                  <div className="form-group col-xs-12 col-sm-12">
                                    <label htmlFor="description">Description</label>
                                    <input
                                      type="text"
                                      name="description"
                                      className="form-control description"
                                      placeholder="Description"
                                      value={this.state.editItem.description}
                                      onChange={(e) => this.handleChange(e)}
                                    />
                                    {this.state.editItem.errorDescription && (
                                      <span className="help-block">
                                        {this.state.editItem.errorDescription}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="modal-footer">
                                <button
                                  type="button"
                                  className="btn btn-default"
                                  data-dismiss="modal"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={() => this.handleEdit()}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => this.setOpen(false)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => this.setOpen(false)}
                      ref={(ref) => (this.cancelButtonRef = ref)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    )
  }
}
