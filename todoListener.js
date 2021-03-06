import {setAttributes} from "./assets/helperFunctions.js"
import {openModal} from "./todoFunctions/openModal.js"

export function createTodos (database) {
database.collection("todo").orderBy("todoPosition").onSnapshot(todoSnapshot => {
  todoSnapshot.docChanges().forEach(todo => {
    let data = todo.doc.data()
    let id = todo.doc.id

    if (todo.type === "added") {
      let todoItem = document.createElement("LI");
      setAttributes(todoItem, 
        {
          "id": id,
          "draggable": true
        })
      todoItem.classList.add("todo")

      let topLine = document.createElement("div");

      // Create and append P tag with Todo content
      let textNode = document.createElement("p");
      textNode.setAttribute("class", "todoContent");
      textNode.textContent = data.todoContent;
      topLine.appendChild(textNode);

      let svgMenuButton = document.createElement("img")
      svgMenuButton.addEventListener("click", () => openModal(todo))
      setAttributes(
        svgMenuButton,
        {
          "src": "./assets/images/hamburger.svg",
          "width": "15px"
        }
      )
      topLine.appendChild(svgMenuButton)


      let bottomLine = document.createElement("div");

      // TODO - This is temporary, need a better way to remove todos
      // Create a remove button for the todos
      let delNode = document.createElement("img")
      setAttributes(
        delNode,
        {
          "src": "./assets/images/trashcan.svg",
          "width": "15px"
        }
      )
      // delNode.classList.add("delNode")
      delNode.addEventListener("click", (e) => {
        database.collection("todo").doc(id).delete()
        let deletedTodo = document.querySelector("#" + CSS.escape(id))
        deletedTodo.remove()
      })
      bottomLine.appendChild(delNode)

      // Create and Append P tag with Date content
      if (data.dateSubmitted) {
        var epochSeconds = data.dateSubmitted.seconds;
        let dateNode = document.createElement("p");
        dateNode.setAttribute("class", "todoDate");
        let date = new Date(epochSeconds * 1000);
        dateNode.textContent = `${date.toLocaleTimeString()} - ${date.toLocaleDateString()}`;
        bottomLine.appendChild(dateNode);
      }
      
      todoItem.appendChild(topLine)
      todoItem.appendChild(bottomLine)



      // Add event listeners for dragging of the Todos
      todoItem.addEventListener('dragstart', (e) => {
        // TODO - I think this dataTransfer function is going to be a cleaner way to transfer information rather than travelling the DOM to get ID's
        e.dataTransfer.setData("element", "Todo")
        e.dataTransfer.setData("id", `${id}`)
        todoItem.classList.add("dragging");
        // todoBeingDragged = true;
        e.stopPropagation();
        })
      todoItem.addEventListener('dragend', () => {
        todoItem.classList.remove("dragging");
        // todoBeingDragged = false;
      })
      todoItem.addEventListener('click', (e) => todoContentOnclick(e, id))

      // Append the new list item to the UL
      let parentSwimlane = document.querySelector("#" + CSS.escape(data.parentSwimlane) + " ul")
      parentSwimlane.appendChild(todoItem);
    } else if (todo.type === "modified") {
      let modifiedTodo = document.querySelector("#" + CSS.escape(id))
      let targetSwimlane = document.querySelector("#" + CSS.escape(data.parentSwimlane) + " ul")
      targetSwimlane.insertBefore(modifiedTodo, targetSwimlane.children[data.todoPosition])
      // modifiedTodo.firstChild.textContent = data.todoContent
      let updatedContent = modifiedTodo.querySelector(".todoContent");
      updatedContent.textContent = data.todoContent;

    } else if (todo.type === "deleted") {
      let deletedTodo = document.querySelector("#" + CSS.escape(id))
      deletedTodo.remove()
    }
  })
})



function todoContentOnclick(e, id) {
  e.preventDefault()
  if (e.target.nodeName === "LI") {
    var input = document.createElement("input")
    setAttributes(input, {
      "value": e.target.firstChild.textContent,
      "class": "todo-content-setter",
      "type": "text"
      // Pulling the Parent node ID so we can update the header on unfocus
      // "data-parentID": e.target.closest("div").id
    })
    input.addEventListener("focusout", (e) => todoContentInputOnfocusout(e, id))
    e.target.firstChild.replaceWith(input)
    document.querySelector(".todo-content-setter").focus()
  }
}

function todoContentInputOnfocusout(e, id) {
  database.collection("todo").doc(id).update({"todoContent": e.target.value})
  var p = document.createElement("p");
  p.addEventListener("click", (e) => todoContentOnclick(e))
  p.textContent = e.target.value
  p.classList.add("todoContent")
  e.target.replaceWith(p)
}
}