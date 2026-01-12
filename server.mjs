import http from "http";
import { initializeDatabase, createDbConnection } from "../db/sqliteClient.mjs";
import {
  handleCreateUser,
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUser,
  handleDeleteUser
} from "../controllers/userController.mjs";

const initDbConnection = createDbConnection();
initializeDatabase(initDbConnection);
setTimeout(() => {
  initDbConnection.close();
}, 500);



function sendJson(response, statusCode, data) {
  const json = JSON.stringify(data, null, 2);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(json);
}

function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    let bodyData = "";

    request.on("data", (chunk) => {
      bodyData += chunk.toString("utf-8");
    });

    request.on("end", () => {
      if (!bodyData) {
        resolve(null);
        return;
      }

      try {
        const parsed = JSON.parse(bodyData);
        resolve(parsed);
      } catch (err) {
        const error = new Error("El cuerpo de la petición no es JSON válido.");
        error.statusCode = 400;
        reject(error);
      }
    });

    request.on("error", (err) => {
      reject(err);
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const { method, url } = req;

    if (method === "GET" && url === "/Usuario") {
      const users = await handleGetAllUsers();
      sendJson(res, 200, { ok: true, data: users });
      return;
    }

    if (method === "GET" && url.startsWith("/Usuario/")) {
      const parts = url.split("/");
      const id = parts[2]; 

      const user = await handleGetUserById(id);
      sendJson(res, 200, { ok: true, data: user });
      return;
    }

    if (method === "POST" && url === "/Usuario") {
      const body = await parseRequestBody(req);
      const newUser = await handleCreateUser(body);
      sendJson(res, 201, { ok: true, data: newUser });
      return;
    }

    if (method === "PUT" && url.startsWith("/Usuario/")) { 
      const parts = url.split("/"); 
      const id = parts[2]; const body = await parseRequestBody(req); 
      const updatedUser = await handleUpdateUser(id, body); 
      sendJson(res, 200, { ok: true, data: updatedUser }); 
      return; 
    }

    if (method === "DELETE" && url.startsWith("/Usuario/")) {
      const id = url.split("/")[2];
      const result = await handleDeleteUser(id);
      sendJson(res, 200, {
        message:"Usuario eliminado correctamente",
        deletedUser: result
      });

      return;
    }

    if (method === "DELETE" && url === "/reset") { 
      const db = createDbConnection(); 
      
      db.exec(` 
        DELETE FROM Usuario; 
        DELETE FROM sqlite_sequence WHERE name='Usuario'; 
        `, (err) => { 
          if (err) { 
            sendJson(res, 500, { ok: false, error: err.message }); } else { 
              sendJson(res, 200, { ok: true, message: "Base de datos reseteada" }); 
            } 
            db.close(); 
          }); 
          
          return; 
    }

    

    sendJson(res, 404, { ok: false, error: "Ruta no encontrada" });
  } catch (err) {
    console.error("Error en la petición:", err);

    const statusCode = err.statusCode || 500;
    sendJson(res, statusCode, {
      ok: false,
      error: err.message || "Error interno del servidor"
    });
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:${PORT}`);
});
