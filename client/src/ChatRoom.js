import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./css/ChatRoom.css";

const socket = io("http://localhost:3001");

function ChatRoom({ user }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleInitChatHistory = (history) => {
      setMessages(history);
    };

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("init_chat_history", handleInitChatHistory);
    socket.on("receive_message", handleReceiveMessage);
    socket.emit("request_chat_history");

    return () => {
      socket.off("init_chat_history", handleInitChatHistory);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = (e) => {
    if (e) e.preventDefault();
    if (message.trim()) {
      socket.emit("send_message", { user, text: message });
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      sendMessage(e);
    }
  };

  const saveHistoryToServer = async () => {
    try {
      await fetch("http://localhost:3001/messages/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      alert("Historial guardat correctament al servidor.");
    } catch (error) {
      alert("Error al guardar l’historial.");
      console.error(error);
    }
  };

  const exportAsJson = async () => {
    try {
      const res = await fetch("http://localhost:3001/messages/export/json");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "chat_history.json";
      link.click();
    } catch (err) {
      alert("Error exportant JSON");
      console.error(err);
    }
  };

  const exportAsTxt = async () => {
    try {
      const res = await fetch("http://localhost:3001/messages/export/txt");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "chat_history.txt";
      link.click();
    } catch (err) {
      alert("Error exportant TXT");
      console.error(err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${
              msg.user === user ? "message-sent" : "message-received"
            }`}
          >
            <b>{msg.user}:</b>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escriu un missatge..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>

      <div className="chat-export">
        <button className="export-button" onClick={exportAsTxt}>
          Descarregar TXT
        </button>
        <button className="export-button" onClick={exportAsJson}>
          Descarregar JSON
        </button>
        <button className="export-button" onClick={saveHistoryToServer}>
          Guardar historial (JSON)
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
