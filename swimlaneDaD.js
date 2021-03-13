document.querySelector(".swimlaneContainer").addEventListener("dragover", (e) => {
  // The If check is here to prevent this dragover event firing while a todo is being dragged
  if (todoBeingDragged != true) {
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
        console.log(todo.id, todoIndex)
        database.collection("todo").doc(todo.id).update({"parentSwimlane": swimlane.id, "todoPosition": todoIndex})
      })
    })
    let todoArray = [...document.querySelectorAll(".todo")]
  }

  // Update the swimlane positions in the database
  swimlaneArray.forEach((swimlane, swimlaneIndex) => {
    database.collection("swimlanes").doc(swimlane.id).update({"swimlanePosition": swimlaneIndex})
  })

})
