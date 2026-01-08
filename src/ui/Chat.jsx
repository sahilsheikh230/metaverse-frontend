import { useEffect, useState } from "react"

import { socket } from "../phaser/socket";


export default function Chat(){
let[message,setmessage]=useState("")
let[receivedmessage,setreceivedmessage]=useState([]);

function handleSubmit(e){
    e.preventDefault();
    socket.emit("message",message);
    
  
 
  
  setmessage('');

   
}

useEffect(()=>{
socket.on("messagereceived",(data)=>{
    setreceivedmessage((prev) => [...prev, data]);



})
},[])
    return (
       <div className="chat-container">
  <div className="chat-header">Nearby Chat</div>

  <div className="chat-messages">
    <div className="chat-bubble other">
       <ul className="ul">
        
          {receivedmessage.map((msg) => (
           
            <li  className="chat-bubble other">
      
      <p className="name">{msg.playername}</p>
      <p className="text">{msg.msg}</p>
                
            </li>
          ))
        }
        </ul>
       
        
         
    
    </div>
  
  </div>
<form onSubmit={handleSubmit}>
  <div className="chat-input">
    <input type="text" placeholder="Type a message..."  value={message} name="message" onChange={(e)=>setmessage(e.target.value)}/>
    <button type="submit">Send</button>
  </div>
  </form>
</div>

    )
}