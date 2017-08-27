import React from 'react';
import {Route} from 'react-router-dom';
import App from './components/app';
import Login from './containers/login';
import TimeSheet from './containers/timesheet';
import AccountsTab from './containers/AccountsTab';

export default () => (
  <div>
    <Route path="/" component={App} />
    <Route path="/login" component={Login} />
    <Route path="/timesheet" component={TimeSheet} />
    <Route path="/accounts" component={AccountsTab} />
  </div>
)
