import React from 'react';
import {Route, Match, Redirect} from 'react-router-dom';
import Header from './header';
import Login from '../containers/login';
import TimeSheet from '../containers/timesheet';
import Input from '../containers/input';
import AccountsTab from '../containers/AccountsTab';

export default class Routes extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Route path="/login" component={Login}/>
        <Route path="/" exact={true} component={TimeSheet}/>
        <Route path="/input" component={Input}/>
        <Route path="/accounts" component={AccountsTab}/>
        <ProtectedRoute path="/protected" component={TimeSheet} />
      </div>
    )
  }
}

const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true
    setTimeout(cb, 100) // fake async
  },
  signout(cb) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    fakeAuth.isAuthenticated ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
    )
  )}/>
)