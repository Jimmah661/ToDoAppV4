import {setAttributes, getDragAfterElement} from "./assets/helperFunctions.js"

export async function makeSwimlanes (database) {

// Listen for the swimlanes. Once found, generate the lanes on the board
// All lanes should stack to the left first, there will always be an empty swimlane on the right that can be added to the board
// All lanes will extend from the top of the Board to the bottom of the visible screen and will have verticle scrolling for the ToDos that are inside it.
// The screen will need to have horizontal scrolling as the lanes will fit a constant width, rather than dynamically resizing.
database.collection("swimlanes").orderBy("swimlanePosition").onSnapshot(swimlaneSnapshot => {

  // Identift the swimlaneContainer and assign it to a variable
  let swimlaneContainer = document.querySelector(".swimlaneContainer")

  // Start Listener for swimlanes
  swimlaneSnapshot.docChanges().forEach(change => {
    if (change.type === "added") {
      // Generate swimlane element then provide it with the relevant class and ID
      let swimlane = document.createElement("div")
      swimlane.classList.add("swimlane", "draggableSwimlane")
      swimlane.setAttribute("draggable", true)
      swimlane.id = change.doc.id

      // Generate swimlaneHeader element and provide it with the relevant class, then append it to the swimlane
      let swimlaneTitle = document.createElement("span")
      swimlaneTitle.textContent = change.doc.data().swimlaneTitle
      swimlaneTitle.classList.add("swimlaneTitle")
      swimlaneTitle.addEventListener("click", (e) => swimlaneHeaderOnclick(e))
      swimlane.append(swimlaneTitle)

      let swimlaneTitleInput = document.createElement("input")
      swimlaneTitleInput.value = change.doc.data().swimlaneTitle
      swimlaneTitleInput.classList.add("swimlaneTitleInput")
      swimlaneTitleInput.style.display = "none"
      // swimlaneTitleInput.addEventListener("focusout", (e) => swimlaneHeaderInputOnfocusout(e))
      swimlane.append(swimlaneTitleInput)

      // Generate the unordered list that all ToDos will be placed in
      let todoList = document.createElement("ul")
      todoList.classList.add("todoList")
      swimlane.append(todoList)

      // Create the Button element used to add a new ToDo, assign it a class and provide it with the + symbol as the inner text. Finally, append it to the swimlane
      let addTodoButton = document.createElement("button")
      addTodoButton.classList.add("addTodoButton")
      addTodoButton.innerText = "+ Add ToDo"
      addTodoButton.addEventListener("click", () => newTodo(change.doc.id))
      swimlane.append(addTodoButton)

      // Set up the listeners for dragging swimlanes
      swimlane.addEventListener("dragstart", (e) => swimlane.classList.add("swimlaneDragging"))
      swimlane.addEventListener("dragend", () => swimlane.classList.remove("swimlaneDragging"))

      // Adding the drag over events for reordering the todos
      swimlane.addEventListener("dragover", (e) => {
        e.preventDefault()
        let droppableSwimlane = e.target.closest("UL")
        let draggingTodo = document.querySelector(".dragging")
        // let afterElement = getDragAfterElement(e.clientY)
        let afterElement = getDragAfterElement(e.clientY, e.dataTransfer.getData("element"), droppableSwimlane)
        droppableSwimlane === null ?  droppableSwimlane = e.target.querySelector("UL") : droppableSwimlane
        //Trying to remove the global "TodoBeingDragged" variable
        // Swapped over to checking the dataTransfer attribute of the drag event 
        if (e.dataTransfer.getData("element") === "Todo" && droppableSwimlane != null) {
          if (afterElement == null) {
            droppableSwimlane.append(draggingTodo)
          } else {
            droppableSwimlane.insertBefore(draggingTodo, afterElement)
          }
        }

      })

      // Insert the swimlane before the newSwimlane option
      swimlaneContainer.insertBefore(swimlane, document.querySelector(".newSwimlane"))
    }
    if (change.type === "modified") {
      // console.log("Modified", change.doc.id)
      // Function to reorder the swimlane list on database modification
      let newElement = document.querySelector("#" + CSS.escape(change.doc.id))
      let parentElement = document.querySelector(".swimlaneContainer")
      parentElement.insertBefore(newElement, parentElement.children[change.doc.data().swimlanePosition])

      // update the Title of the Swimlane if the information changes in the database
      let swimlaneTitle = document.querySelector(`#${CSS.escape(change.doc.id)} span`)
      if (swimlaneTitle != change.doc.data().swimlaneTitle) {
        swimlaneTitle.textContent = change.doc.data().swimlaneTitle
      }
    }
    if (change.type ==="removed") {
      // console.log("removed", change.doc.id)
      let removedSwimlane = document.querySelector(`#${CSS.escape(change.doc.id)}`)
      removedSwimlane.remove()

      function updatePositions () {
        let swimlaneArray = [...document.querySelectorAll(".swimlane:not(.newSwimlane)")]
        swimlaneArray.forEach((item, index) => {
          database.collection("swimlanes").doc(item.id).update({"swimlanePosition": index})
        })
      }
      updatePositions()
    }
  })
})

// These functions convert the Swimlane Header into an input field so that you can modify the title
function swimlaneHeaderOnclick(e) {
  var input = document.createElement("input")
  setAttributes(input, {
    "value": e.target.textContent,
    "class": "swimlane-header-setter",
    // Pulling the Parent node ID so we can update the header on unfocus
    "data-parentID": e.target.closest("div").id
  })
  input.addEventListener("focusout", (e) => swimlaneHeaderInputOnfocusout(e))
  e.target.replaceWith(input)
  document.querySelector(".swimlane-header-setter").focus()
}

// update the swimlaneHeader when unfocusing from the input field
function swimlaneHeaderInputOnfocusout(e) {
  database.collection("swimlanes").doc(e.target.dataset.parentid).update({"swimlaneTitle": e.target.value})
  var span = document.createElement("span");
  span.addEventListener("click", (e) => swimlaneHeaderOnclick(e))
  span.append(e.target.value)
  span.classList.add("swimlane-header")
  e.target.replaceWith(span)
}


// Function generates a new Todo card in the swimlane
function newTodo (swimlaneID) {
  let currentSwimlane = document.querySelector("#" + CSS.escape(swimlaneID))
  let currentSwinlaneTodos = [...currentSwimlane.querySelectorAll('.todo')]
  let newTodo = {
    dateSubmitted: new Date(),
    todoPosition: currentSwinlaneTodos.length,
    todoContent: "New Card",
    isCompleted: false,
    parentSwimlane: swimlaneID
  }
  database.collection("todo").add(newTodo)
}
}