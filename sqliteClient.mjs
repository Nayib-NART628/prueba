import sqlite3 from "sqlite3";
import path from "path";

sqlite3.verbose();

const DB_PATH = "data/app.db";

export function createDbConnection() {
  const absolutePath = path.resolve(DB_PATH);

  console.log("USANDO BASE DE DATOS:", absolutePath);

  const db = new sqlite3.Database(absolutePath, (err) => {
    if (err) {
      console.error("Error abriendo la base de datos SQLite:", err.message);
    } else {
      console.log("Conexión SQLite abierta en", absolutePath);
    }
  });

  return db;
}

export function initializeDatabase(db) {
  const createUsuarioTableSQL = `
    CREATE TABLE IF NOT EXISTS Usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Correo TEXT NOT NULL UNIQUE,
      Nombre TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `;

  const createUserDeletionsLogTableSQL = `
    CREATE TABLE IF NOT EXISTS user_deletions_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      deleted_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES Usuario(id)
    );
  `;

  const createProductosTableSQL = `
    CREATE TABLE IF NOT EXISTS Productos (
      id INTEGER PRIMARY KEY,
      Producto TEXT NOT NULL,
      Precio TEXT NOT NULL,
      Stock TEXT NOT NULL
    );
  `;


  db.serialize(() => {
    db.run(createUsuarioTableSQL, (err) => {
      if (err) {
        console.error("Error creando la tabla Usuario:", err.message);
      } else {
        console.log("Tabla Usuario verificada/creada correctamente.");
      }
    });

    db.run(createUserDeletionsLogTableSQL, (err) => {
      if (err) {
        console.error("Error creando la tabla user_deletions_log:", err.message);
      } else {
        console.log("Tabla user_deletions_log verificada/creada correctamente.");
      }
    });

    db.run(createProductosTableSQL, (err) => {
      if (err) {
        console.error("Error creando la tabla productos:", err.message);
      } else {
        console.log("Tabla Productos verificada/creada correctamente.");
      }
    });
  });
}