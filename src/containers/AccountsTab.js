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
      items:[],
      selectedIds:[]
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit(e) {
    e.preventDefault();
    const itemsRef = firebase.database().ref('items');
    const item = {
      accountName: this.state.accountName,
      accountNumber: this.state.accountNumber,
      clientName: this.state.clientName,
      matterTitle: this.state.matterTitle
    };
    itemsRef.push(item);
    this.setState({
      accountName: '',
      accountNumber: '',
      clientName: '',
      matterTitle: ''
    })

  }

  componentDidMount() {
    const itemsRef = firebase.database().ref('items');
    itemsRef.on('value', (snapshot)=> {
      let items = snapshot.val();
      let newState = [];
      for (let item in items) {
        newState.push({
          id: item,
          accountName: items[item].accountName,
          accountNumber: items[item].accountNumber,
          clientName: items[item].clientName,
          matterTitle: items[item].matterTitle

        });
      }
      this.setState({
        items: newState
      })
    })
  }

  removeItem(itemId) {
    const itemRef = firebase.database().ref(`/items/${itemId}`);
    itemRef.remove();
  }

  render() {
    return (
      <div>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="inputAccountName" className="col-sm-2 control-label">Account Name</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="inputAccountName" name="accountName"
                     onChange={this.handleChange} value={this.state.accountName} placeholder=""/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputAccountNumber" className="col-sm-2 control-label">Account Number</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="inputAccountNumber" name="accountNumber"
                     onChange={this.handleChange} value={this.state.accountNumber} placeholder=""/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputClientName" className="col-sm-2 control-label">Client Name</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="inputClientName" name="clientName"
                     onChange={this.handleChange} value={this.state.clientName} placeholder=""/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputMatterTitle" className="col-sm-2 control-label">Matter Title</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" id="inputMatterTitle" name="matterTitle"
                     onChange={this.handleChange} value={this.state.matterTitle} placeholder=""/>
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              <button type="submit" className="btn btn-default">Submit</button>
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
            {this.state.items.map((item)=> {
              return (
                <tr key={item.id}>
                  <th><div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={this.state.selectedIds.indexOf(item.id) !== -1}
                        onChange={()=>{
                          /*
                           * onChange gets called everytime the checkbox is clicked.
                           * We check if the key is in the array already, add if not, delete if yes.
                           */
                          let tempArray = this.state.selectedIds;

                          if (this.state.selectedIds.indexOf(item.id) !== -1) {
                            tempArray.splice(this.state.selectedIds.indexOf(item.id), 1);
                          } else {
                            tempArray.push(item.id);
                          }

                          this.setState({
                            selectedIds: tempArray
                          });
                        }}
                      />
                    </label>
                  </div></th>
                  <td>{item.accountName}</td>
                  <td>{item.accountNumber}</td>
                  <td>{item.clientName}</td>
                  <td>{item.matterTitle}</td>
                </tr>
              )
            })}
            </tbody>
          </table>
          <button onClick={()=>{
            this.state.selectedIds.forEach((item)=>{
              this.removeItem(item);
            });
            this.setState({selectedIds:[]})

          }}>Delete</button>
        </div>
      </div>
    )
  }
}

export default NewAccountInput;