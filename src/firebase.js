import firebaseApp from 'firebase'

const config = {
  apiKey: "AIzaSyB_4m1IAAXGg32T4wKfzgZyem_Bmt4CAJI",
  authDomain: "jabba-track.firebaseapp.com",
  databaseURL: "https://jabba-track.firebaseio.com",
  projectId: "jabba-track",
  storageBucket: "jabba-track.appspot.com",
  messagingSenderId: "356648649902"
};

//the root app just in case we need it
export const firebase = firebaseApp.initializeApp(config);

export const db = firebase.database(); //the real-time database
export const auth = firebase.auth(); //the firebase auth namespace

export const storageKey = 'JABBA_TRACKER';

export const isAuthenticated = () => {
  return !!auth.currentUser || !!localStorage.getItem(storageKey);
};
