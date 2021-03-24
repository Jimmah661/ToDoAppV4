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