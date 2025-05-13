import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./css/FileUploader.css";

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
    if (!file) return alert("¡Selecciona un archivo primero!");
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:3001/documents/upload", formData);
      alert("¡Archivo subido correctamente!");
      setFile(null);
      fetchFiles();
    } catch (err) {
      alert("Error al subir: " + err.response.data.error);
    }
  };

  const handleOpen = async (filename) => {
    try {
      const res = await axios.get(`http://localhost:3001/documents/read/${filename}`);
      setSelectedFile(filename);
      setFileContent(res.data.content);
      setLastModified(new Date());
    } catch (err) {
      alert("No se pudo leer el archivo.");
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setFileContent(newContent);
    setLastModified(new Date());
    socket.emit("edit_document", newContent);
  };

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
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="file-uploader-container">
      <div className="file-uploader-controls">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="file-input"
        />
        <button onClick={handleUpload} className="upload-button">
          Subir
        </button>
      </div>

      <div className="file-list-and-editor">
        <div className="file-list-container">
          <h3>Archivos disponibles:</h3>
          <ul className="file-list">
            {files.map((filename, index) => (
              <li key={index} className="file-item">
                <span>📄 {filename}</span>
                <div className="file-actions">
                  <a
                    href={`http://localhost:3001/documents/download/${filename}`}
                    download={filename}
                    className="download-button"
                  >
                    Descargar
                  </a>
                  <button onClick={() => handleOpen(filename)} className="open-button">
                    Abrir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedFile && (
          <div className="editor-container">
            <div className="editing-info">
              <span>
                Editando: {selectedFile} | Último cambio: {formatTime(lastModified)}
              </span>
            </div>
            <textarea
              value={fileContent}
              onChange={handleContentChange}
              className="editor-textarea"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUploader;