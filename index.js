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




// TODO - This stuff needs to be cut up and split into other modules/functions
document.querySelector(".swimlaneContainer").addEventListener("dragover", (e) => {
  // The If check is here to prevent this dragover event firing while a todo is being dragged
  if (e.dataTransfer.getData("element") !== "Todo") {
    let swimlaneContainer = document.querySelector(".swimlaneContainer")
    e.preventDefault();
    let swimlaneDragging = document.querySelector(".swimlaneDragging")
    const afterSwimlane = getDragAfterSwimlane(e.clientX)
    if (afterSwimlane == null) {
      swimlaneContainer.insertBefore(swimlaneDragging, document.querySelector(".newSwimlane"))
    } else {
      swimlaneContainer.insertBefore(swimlaneDragging, afterSwimlane)
    } 
  }
})

function getDragAfterSwimlane(xCoordinate) {
  let swimlaneArray = [...document.querySelectorAll(".swimlane:not(.swimlaneDragging):not(.newSwimlane)")]
  return swimlaneArray.reduce((previous, current) => {
    let box = current.getBoundingClientRect();
    const offset = xCoordinate - box.left - box.width / 2
    if (offset < 0 && offset > previous.offset) {
      return {offset: offset, element: current}
    } else {
      return previous
    }
  }, { offset: Number.NEGATIVE_INFINITY}).element
}

document.querySelector(".swimlaneContainer").addEventListener("dragend", (e) => {
  let swimlaneArray = [...document.querySelectorAll(".swimlane:not(.newSwimlane")]
  // TODO - Need function to do an update of the todo's on the database
  if (e.target.nodeName === "LI") {
    swimlaneArray.forEach((swimlane, swimlaneIndex) => {
      let todoArray = [...swimlane.querySelectorAll(".todo")]
      todoArray.forEach((todo, todoIndex) => {
        database.collection("todo").doc(todo.id).update({"parentSwimlane": swimlane.id, "todoPosition": todoIndex})
      })
    })
  }

  // Update the swimlane positions in the database
  swimlaneArray.forEach((swimlane, swimlaneIndex) => {
    database.collection("swimlanes").doc(swimlane.id).update({"swimlanePosition": swimlaneIndex})
  })

})
