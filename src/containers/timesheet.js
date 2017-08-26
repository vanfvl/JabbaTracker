import React, { Component } from 'react';
import firebase from '../firebase';

class TimeSheet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      entries: []
    }
  }

  componentDidMount() {
    const entriesRef = firebase.database().ref('entries');
    entriesRef.on('value', (snapshot) => {
      console.log(snapshot);
      console.log('val', snapshot.val());
    })
  }

  render() {
    return (
      <div>
        Time entries
      </div>
    )
  }
}

export default TimeSheet;
