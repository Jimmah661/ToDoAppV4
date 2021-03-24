import {makeSwimlanes} from "./swimlaneListener.js"
import {createTodos} from "./todoListener.js"
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCnag-BJpnfcTbf1oVMACMYKsIE26TxoMg",
  authDomain: "todolistv3-c5920.firebaseapp.com",
  projectId: "todolistv3-c5920",
  storageBucket: "todolistv3-c5920.appspot.com",
  messagingSenderId: "435939733429",
  appId: "1:435939733429:web:b2cf44af52faf1217233fc"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Defining the global variables to be used in the system
var database = null
var user = null
var auth = firebase.auth()

function setAttributes(element, attributes) {
  for(var key in attributes) {
    element.setAttribute(key, attributes[key])
  }
}

auth.onAuthStateChanged((user) => {
  if (!user && location.pathname != "/login.html") {
    window.location.replace("./login.html")
  } else {
    // Update the database to point to the User account
    database = firebase.firestore().collection("users").doc(user.uid)

    // Make the Swimlanes as per what is in the users container
    makeSwimlanes(database)
      .then(() => {
        createTodos(database)
      })
    
    // Creating the listener to generate new swimlanes
    document.querySelector('.addSwimlaneButton').addEventListener("click", () => {
      let currentSwimlanes = [...document.querySelectorAll(".swimlane:not(.newSwimlane)")]
      let newSwimlane = {
        swimlaneTitle: "New Swimlane",
        swimlanePosition: currentSwimlanes.length
      }
      database.collection("swimlanes").add(newSwimlane)
    })
  }
})