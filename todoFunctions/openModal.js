export function openModal (todo) {
  // console.log(todo.doc.data())
  let modal = document.createElement("div")
  modal.classList.add("todoModal")

  let exitButton = document.createElement("span")
  exitButton.addEventListener("click", () => modal.remove())
  exitButton.textContent = "X"
  modal.appendChild(exitButton)
  console.log(modal)
  document.body.appendChild(modal)
}