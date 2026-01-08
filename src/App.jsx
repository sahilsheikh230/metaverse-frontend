

import { useEffect, useState } from 'react'
import './App.css'
import CreateGame from './phaser/createGame'
import Login from './ui/login'
import { socket } from './phaser/socket'
import Chat from './ui/Chat'



function App() {

  let[joined,setjoined]=useState(false);
let[canchat,setchat]=useState(new Set());
let[onconnect,setonconnect]=useState(false);
let[onConnectname,setonconnectname]=useState("")
let[ondisconnect,setondisconnect]=useState(false);
let[ondisconnectname,setondisconnectname]=useState("");
useEffect(()=>{
socket.on("chat", (id) => {
  setchat(prev => {
    const copy = new Set(prev);
    copy.add(id);

    return copy;
  });
});
socket.on("far", (id) => {
  setchat(prev => {
    const copy = new Set(prev);
    copy.delete(id);
    return copy;
  });
});

socket.on("player-connected", (name) => {

    setonconnectname(name);
    setonconnect(true);
  
});
socket.on("ondisconnect",(name)=>{
setondisconnectname(name);
setondisconnect(true);
})

return()=>{
  socket.off("chat")
  socket.off("far");
  socket.off("player-connected")
  socket.off("ondisconnect");
}
},[])
useEffect(()=>{
   const timer=setTimeout(()=>{
    setonconnect(false)
    setondisconnect(false);
  },3000)

    return () => clearTimeout(timer)
},[onconnect,ondisconnect])

  return (
    <div>
 {!joined && <Login onJoin={()=>setjoined(true)}></Login>}
{onconnect && (
  <div style={{
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "white",
    color: "green",
    padding: "10px",
    zIndex: 9999
  }}>
 {onConnectname} connected
  </div>
)}
{ondisconnect && (
  <div style={{
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "white",
    color: "red",
    padding: "10px",
    zIndex: 9999
  }}>
 {ondisconnectname} disconnected
  </div>
)}

 
 {joined &&  <CreateGame></CreateGame>}
 {canchat.size>0 && <Chat ></Chat>}
    </div>

  )
}

export default App
