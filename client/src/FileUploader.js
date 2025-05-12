import React, { useState, useEffect } from "react";
import axios from "axios";

function FileUploader() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

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
      const res = await axios.get(
        `http://localhost:3001/documents/read/${filename}`
      );
      setSelectedFile(filename);
      setFileContent(res.data.content);
    } catch (err) {
      alert("No s'ha pogut llegir l'arxiu.");
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(`http://localhost:3001/documents/save/${selectedFile}`, {
        content: fileContent,
      });
      alert("Fitxer desat correctament!");
    } catch (err) {
      alert("Error en desar l'arxiu.");
    }
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
          <h4>Editant: {selectedFile}</h4>
          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            rows={12}
            cols={70}
          />
          <br />
          <button onClick={handleSave} style={{ marginTop: "10px" }}>
            Guardar canvis
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
