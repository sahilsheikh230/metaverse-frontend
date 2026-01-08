import { useState } from "react";
import { socket } from "../phaser/socket";

export default function Login({ onJoin }) {
  const [name, setName] = useState("");
  const [showError, setShowError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    const trimmed = name.trim();

    if (trimmed === "") {
      setShowError(true);
      return;
    }

    setShowError(false);
    socket.emit("name", { name: trimmed });
    onJoin(trimmed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div id="login-overlay">
        <div className="login-box">
          <h2>Enter your name</h2>

          <input
            id="usernameInput"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {showError && (
            <p className="emptyname" style={{color:"red"}}>Name cannot be empty</p>
          )}

          <button id="joinBtn" type="submit">
            Enter World
          </button>
        </div>
      </div>
    </form>
  );
}
