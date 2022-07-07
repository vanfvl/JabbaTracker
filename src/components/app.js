import React from 'react'
import { Route, Match, Redirect } from 'react-router-dom'
import Header from './header'
import Login from '../containers/login'
import TimeSheet from '../containers/timesheet'
import ThemisSheet from '../containers/themissheet'
import Input from '../containers/input'
import AccountsTab from '../containers/AccountsTab'
import Summary from '../containers/summary'
import { isAuthenticated, auth, storageKey } from '../firebase'
import Layout from './layout'

export default class App extends React.Component {
  state = {
    uid: null
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        window.localStorage.setItem(storageKey, user.uid)
        this.setState({ uid: user.uid })
      } else {
        window.localStorage.removeItem(storageKey)
        this.setState({ uid: null })
      }
    })
  }

  render() {
    return (
      <Layout>
        <Route path="/login" component={Login} />
        <ProtectedRoute path="/" exact={true} component={TimeSheet} />
        <ProtectedRoute path="/themissheet" exact={true} component={ThemisSheet} />
        <ProtectedRoute path="/input" component={Input} />
        <ProtectedRoute path="/accounts" component={AccountsTab} />
        <ProtectedRoute path="/summary" component={Summary} />
      </Layout>
    )
  }
}

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location }
          }}
        />
      )
    }
  />
)
