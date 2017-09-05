import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import {Route} from 'react-router-dom';
import { auth, isAuthenticated } from '../firebase';

export default class Header extends Component {
  renderLink(to, label, activeOnlyWhenExact) {
    return (
      <Route path={to} exact={activeOnlyWhenExact} children={({ match }) => (
        <li className={ match && 'active' }>
          <Link to={to}>{label}</Link>
        </li>
      )}/>
    )
  }

  signOut(e) {
    e.preventDefault();

    auth.signOut();
    window.location.reload();
  }

  render() {
    return (
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                    data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link className="navbar-brand" to="/">Jabba Tracker</Link>
          </div>

          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              { this.renderLink('/', 'Time Sheet', true) }
              { this.renderLink('/themissheet', 'Themis Sheet') }
              { this.renderLink('/input', 'Input') }
              { this.renderLink('/accounts', 'Accounts') }
              { this.renderLink('/summary', 'Summary') }
            </ul>
            <ul className="nav navbar-nav navbar-right">
              {isAuthenticated() ? (
                <li>
                  <a href="#" onClick={this.signOut.bind(this)}>Sign Out</a>
                </li>
              ) : (
                <li>
                  <Link to="/login">Login</Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <style jsx>{`
          .navbar {
            margin-top: 1em;
          }
        `}</style>
      </nav>
    );
  }
}
