import React from 'react';
import {Route} from 'react-router-dom';
import App from './components/app';
import Login from './containers/login';
import TimeSheet from './containers/timesheet';
import Input from './containers/input';
import AccountsTab from './containers/AccountsTab';
import SummaryTab from './containers/summary';

export default () => (
  <div>
    <Route path="/" component={App} />
    <Route path="/login" component={Login} />
    <Route path="/timesheet" component={TimeSheet} />
    <Route path="/input" component={Input} />
    <Route path="/accounts" component={AccountsTab} />
    <Route path="/summary" component={SummaryTab} />
  </div>
)
