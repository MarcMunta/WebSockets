import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function FileUploader() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [lastModified, setLastModified] = useState(null);

  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:3001/documents/list");
      setFiles(res.data);
    } catch (err) {
      console.error("Error al obtener la lista de archivos:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    socket.on("document_update", (updatedContent) => {
      setFileContent(updatedContent);
      setLastModified(new Date());
    });

    return () => {
      socket.off("document_update");
    };
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Selecciona un fitxer primer!");
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:3001/documents/upload", formData);
      alert("Fitxer pujat correctament!");
      setFile(null);
      fetchFiles();
    } catch (err) {
      alert("Error al pujar: " + err.response.data.error);
    }
  };

  const handleOpen = async (filename) => {
    try {
      const res = await axios.get(`http://localhost:3001/documents/read/${filename}`);
      setSelectedFile(filename);
      setFileContent(res.data.content);
      setLastModified(new Date());
    } catch (err) {
      alert("No s'ha pogut llegir l'arxiu.");
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setFileContent(newContent);
    setLastModified(new Date());
    socket.emit("edit_document", newContent);
  };

  // Autosave cada 5 segundos si hay archivo seleccionado
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedFile) {
        axios
          .post(`http://localhost:3001/documents/save/${selectedFile}`, {
            content: fileContent,
          })
          .catch((err) => {
            console.error("Error en autosave:", err);
          });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedFile, fileContent]);

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("ca-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div>
      <h2>Pujar Fitxer</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Pujar</button>

      <h3>Fitxers disponibles:</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {files.map((filename, index) => (
          <li
            key={index}
            style={{
              marginBottom: "0.5rem",
              background: "#1e1f2f",
              padding: "0.5rem",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#66ccff" }}>📄 {filename}</span>
            <div>
              <a
                href={`http://localhost:3001/documents/download/${filename}`}
                download={filename}
                style={{
                  marginRight: "10px",
                  color: "#ffffff",
                  backgroundColor: "#444",
                  padding: "4px 8px",
                  borderRadius: "5px",
                  textDecoration: "none",
                }}
              >
                Descarregar
              </a>
              <button onClick={() => handleOpen(filename)}>Obrir</button>
            </div>
          </li>
        ))}
      </ul>

      {selectedFile && (
        <div style={{ marginTop: "20px" }}>
          <h4>
            Editant: {selectedFile}
            <span style={{ marginLeft: "20px", fontSize: "0.9em", color: "#aaa" }}>
              Últim canvi: {formatTime(lastModified)}
            </span>
          </h4>
          <textarea
            value={fileContent}
            onChange={handleContentChange}
            rows={12}
            cols={70}
          />
        </div>
      )}
    </div>
  );
}

export default FileUploader;
