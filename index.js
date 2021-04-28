import {makeSwimlanes} from "./swimlaneListener.js"
import {createTodos} from "./todoListener.js"
import {getDragAfterElement} from "./assets/helperFunctions.js"
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

// Checking if the user is logged in - If not redirect to the login page
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



if (user) {
  // TODO - This stuff needs to be cut up and split into other modules/functions
  document.querySelector(".swimlaneContainer").addEventListener("dragover", (e) => {
    // The If check is here to prevent this dragover event firing while a todo is being dragged
    if (e.dataTransfer.getData("element") !== "Todo") {
      let swimlaneContainer = document.querySelector(".swimlaneContainer")
      e.preventDefault();
      let swimlaneDragging = document.querySelector(".swimlaneDragging")
      const afterSwimlane = getDragAfterElement(e.clientX, e.dataTransfer.getData("element"))
      if (afterSwimlane == null) {
        swimlaneContainer.insertBefore(swimlaneDragging, document.querySelector(".newSwimlane"))
      } else {
        swimlaneContainer.insertBefore(swimlaneDragging, afterSwimlane)
      } 
    }
  })

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
}


// Alternate between login form and signup form
document.querySelector("#signUpButton").addEventListener("click", (e) => {
  e.preventDefault()
  // console.log(e)
  document.querySelector("#loginForm").classList.add("inactive");
  document.querySelector("#signupForm").classList.remove("inactive");
})
document.querySelector("#loginButton").addEventListener("click", (e) => {
  e.preventDefault()
  document.querySelector("#signupForm").classList.add("inactive");
  document.querySelector("#loginForm").classList.remove("inactive");
})

// Signup function
document.querySelector("#signup").addEventListener("click", (e) => {
  e.preventDefault()
  let myForm = document.getElementById('signupForm')
  let formResults = [...myForm.querySelectorAll("input")].reduce((acc, val) => {return {...acc, [val.id] :val.value }}, {})
  if (formResults.signupPassword != formResults.verifyPassword) {
    alert("Passwords don't match");
    return;
  }
  auth.createUserWithEmailAndPassword(formResults.signupEmail, formResults.signupPassword)
    .then((credential) => {
      window.location.replace('./')
    })
    .catch((error) => {
      // Checking for common error codes and alerting to the issue
      // TODO - Update this to an inline error message rather than an alert
      switch(error.code) {
        case("auth/email-already-in-use"): 
          alert("This email is already in use")
          break;
        case("auth/invalid-email"):
        alert("Please provide a valid email")
          break;
        case("auth/weak-password"):
          alert("Invalid Password: Password must be at least 6 characters long")
          break;
        case("auth/internal-error"):
          alert("Internal Server Error: Please try again later")
          break;
        default:
          alert("Error: There was an unexpected error")
          break;
      }
    })
})

// Login Function
document.querySelector("#login").addEventListener("click", (e) => {
  e.preventDefault()
  let myForm = document.getElementById('loginForm')
  let formResults = [...myForm.querySelectorAll("input")].reduce((acc, val) => {return {...acc, [val.id] :val.value }}, {})
  auth.signInWithEmailAndPassword(formResults.email, formResults.password)
    .then((userCred) => {
      window.location.replace('./')
    })
    .catch((error) => {
      console.log(error)
    })
})