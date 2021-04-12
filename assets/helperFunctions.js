export function setAttributes(element, attributes) {
  for(var key in attributes) {
    element.setAttribute(key, attributes[key])
  }
}

export function getDragAfterElement(coord, element, droppableSwimlane) {
  // Check what sort of array we're making based off of the dataTransfer information
  let array = element ?
    // This turnery operator exists only to prevent console errors when you're not floating over a UL
    droppableSwimlane ? [...droppableSwimlane.querySelectorAll(".todo:not(.dragging)")] : [] :
    [...document.querySelectorAll(".swimlane:not(.swimlaneDragging):not(.newSwimlane)")];

  return array.reduce((accumulator, currentValue) => {
    const box = currentValue.getBoundingClientRect()
    // performing the correct offset calculation based on the datatransfer information
    const offset = element ? 
      coord - box.top - box.height / 2 :
      coord - box.left - box.width / 2;
    if (offset < 0 && offset > accumulator.offset) {
      return { offset: offset, element: currentValue }
    } else {
      return accumulator
    }

  }, {offset: Number.NEGATIVE_INFINITY}).element
}