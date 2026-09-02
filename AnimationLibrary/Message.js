const MESSAGE_BOX_ID = "message";
const MESSAGE_STATUS_ID = "messageStatus";

export function setAnimationMessage(message) {
  const text = String(message ?? "");
  const messageBox = document.getElementById(MESSAGE_BOX_ID);
  const messageStatus = document.getElementById(MESSAGE_STATUS_ID);

  if (messageBox) {
    messageBox.value = text;
  }
  if (messageStatus) {
    messageStatus.textContent = text;
  }
}

