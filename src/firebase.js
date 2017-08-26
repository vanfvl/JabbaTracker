import firebase from 'firebase'
const config = {
  apiKey: "AIzaSyB_4m1IAAXGg32T4wKfzgZyem_Bmt4CAJI",
  authDomain: "jabba-track.firebaseapp.com",
  databaseURL: "https://jabba-track.firebaseio.com",
  projectId: "jabba-track",
  storageBucket: "jabba-track.appspot.com",
  messagingSenderId: "356648649902"
};
firebase.initializeApp(config);
export default firebase;
