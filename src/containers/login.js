import React, {Component} from 'react';
import { auth } from '../firebase';
import { Redirect } from 'react-router-dom';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      redirectToReferrer: false,
      error: '',
    }
  }

  handleSubmit(evt) {
    evt.preventDefault();
    auth.signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.setState({redirectToReferrer: true});
      })
      .catch((e) => {
        this.setState({error: e.message});
      });
  }

  render() {
    const { from } = this.props.location.state || '/';
    const { redirectToReferrer, error } = this.state;

    return (
      <div className="col-xs-12 col-sm-offset-4 col-sm-4">
        {redirectToReferrer && (
          <Redirect to={from || '/protected'}/>
        )}
        {from && (
          <p className="bg-warning" style={{ padding: '1em' }}>You must log in to view the page at <code>{from.pathname}</code>.</p>
        )}

        {error && (
          <p className="bg-danger" style={{ padding: '1em' }}>{error}</p>
        )}

        <form onSubmit={this.handleSubmit.bind(this)}>
          <div className="form-group">
            <label htmlFor="exampleInputEmail1">Email address</label>
            <input type="email" className="form-control" id="exampleInputEmail1" placeholder="Email"
                   onChange={(event)=>{this.setState({email: event.target.value})}}
                   value={this.state.email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="exampleInputPassword1">Password</label>
            <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password"
                   onChange={event=>{this.setState({password: event.target.value})}}
                   value={this.state.password}
            />
          </div>
          <button type="submit" className="btn btn-default">Submit</button>
        </form>
      </div>
    )
  }


}

export default Login;
