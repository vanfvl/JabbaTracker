import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import {Route} from 'react-router-dom';

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
              { this.renderLink('/input', 'Input') }
              { this.renderLink('/accounts', 'Accounts') }
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li className="dropdown">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                   aria-expanded="false">Profile <span className="caret"></span></a>
                <ul className="dropdown-menu">
                  <li><a href="#">Action</a></li>
                  <li><a href="#">Another action</a></li>
                  <li><a href="#">Something else here</a></li>
                  <li role="separator" className="divider"></li>
                  <li><a href="#">Separated link</a></li>
                </ul>
              </li>
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
