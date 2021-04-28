export function deleteItem(itemId, itemType) {
  switch (itemType) {
    case ("todos") :
      console.log("delete Todo")
      database.collection(itemType).doc(itemId).delete()
      return;
    case ("swimlane") :
      console.log("delete Swimlane")
      return;
    default:
      return;
  }
};