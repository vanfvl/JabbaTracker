import React from 'react';
import {Route} from 'react-router-dom';
import Header from './components/header';
import Login from './containers/login';
import TimeSheet from './containers/timesheet';
import Input from './containers/input';
import AccountsTab from './containers/AccountsTab';

export default class Routes extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Route path="/login" component={Login}/>
        <Route path="/" exact={true} component={TimeSheet}/>
        <Route path="/input" component={Input}/>
        <Route path="/accounts" component={AccountsTab}/>
      </div>
    )
  }
}
