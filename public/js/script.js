const socket = io();

document.addEventListener("keydown", (e)=>{
  socket.emit("keypress", msg)
})


document.addEventListener("keyup", (e)=>{
  console.log("stop")
})