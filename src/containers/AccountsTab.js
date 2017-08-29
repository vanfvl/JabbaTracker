import React, {Component} from 'react';
import {Route, IndexRoute} from 'react-router-dom';
import firebase from '../firebase';

class NewAccountInput extends Component {
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
      editId: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
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
      })
    })
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
    return (
      <div>
        <form className="form-horizontal" onSubmit={this.state.editMode ? this.handleEdit : this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="inputAccountName" className="col-sm-2 control-label">Account Name</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="inputAccountName" name="accountName"
                     onChange={this.handleChange} value={this.state.accountName} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputAccountNumber" className="col-sm-2 control-label">Account Number</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="inputAccountNumber" name="accountNumber"
                     onChange={this.handleChange} value={this.state.accountNumber} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputClientName" className="col-sm-2 control-label">Client Name</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="inputClientName" name="clientName"
                     onChange={this.handleChange} value={this.state.clientName} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputMatterTitle" className="col-sm-2 control-label">Matter Title</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="inputMatterTitle" name="matterTitle"
                     onChange={this.handleChange} value={this.state.matterTitle} />
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              <button type="submit" className="btn btn-default">
                { this.state.editMode ? "Save" : "Submit" }</button>
            </div>
          </div>
        </form>
        <div className="wrapper">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Account Name</th>
                <th>Account Number</th>
                <th>Client Name</th>
                <th>Matter Title</th>
              </tr>
            </thead>
            <tbody>
            {this.state.accounts.map((account)=> {
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
          <button onClick={() => {this.toggleEdit()}}>{ this.state.editMode ? "Cancel" : "Edit" }</button>
          <button onClick={()=>{
            this.state.selectedIds.forEach((account)=>{
              this.removeItem(account);
            });
            this.setState({selectedIds:[]})

          }}>Delete</button>
        </div>
      </div>
    )
  }
}

export default NewAccountInput;