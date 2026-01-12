import { createDbConnection } from "../db/sqliteClient.mjs";

// Crear usuario
export function createUser({ Correo, Nombre }) {
  const db = createDbConnection();
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO Usuario (Correo, Nombre, created_at)
    VALUES (?, ?, ?);
  `;

  return new Promise((resolve, reject) => {
    db.run(sql, [Correo, Nombre, createdAt], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          Correo,
          Nombre,
          created_at: createdAt
        });
      }
      db.close();
    });
  });
}

// Obtener todos
export function getAllUsers() {
  const db = createDbConnection();

  const sql = `
    SELECT id, Correo, Nombre, created_at
    FROM Usuario
    ORDER BY id ASC;
  `;

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
      db.close();
    });
  });
}

// Obtener por ID
export function getUserById(id) {
  const db = createDbConnection();

  const sql = `
    SELECT id, Correo, Nombre, created_at
    FROM Usuario
    WHERE id = ?;
  `;

  return new Promise((resolve, reject) => {
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
      db.close();
    });
  });
}

// Actualizar
export function updateUser({ id, Correo, Nombre }) {
  const db = createDbConnection();

  const sql = `
    UPDATE Usuario
    SET Correo = ?, Nombre = ?
    WHERE id = ?;
  `;

  return new Promise((resolve, reject) => {
    db.run(sql, [Correo, Nombre, id], function (err) {
      if (err) {
        db.close();
        reject(err);
        return;
      }

      if (this.changes === 0) {
        db.close();
        resolve(null);
        return;
      }

      const selectSql = `
        SELECT id, Correo, Nombre, created_at
        FROM Usuario
        WHERE id = ?;
      `;

      db.get(selectSql, [id], (err2, row) => {
        db.close();
        if (err2) reject(err2);
        else resolve(row || null);
      });
    });
  });
}

// Borrar con log
export function deleteUserWithLog(id) {
  const db = createDbConnection();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION;", (err) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        const selectSql = `
          SELECT id, Correo, Nombre, created_at
          FROM Usuario
          WHERE id = ?;
        `;

        db.get(selectSql, [id], (errSelect, userRow) => {
          if (errSelect) {
            db.run("ROLLBACK;", () => {
              db.close();
              reject(errSelect);
            });
            return;
          }

          if (!userRow) {
            db.run("ROLLBACK;", () => {
              db.close();
              resolve(null);
            });
            return;
          }

          const deletedAt = new Date().toISOString();

          const insertLogSql = `
            INSERT INTO user_deletions_log (user_id, email, deleted_at)
            VALUES (?, ?, ?);
          `;

          db.run(
            insertLogSql,
            [userRow.id, userRow.Correo, deletedAt],
            function (errInsertLog) {
              if (errInsertLog) {
                db.run("ROLLBACK;", () => {
                  db.close();
                  reject(errInsertLog);
                });
                return;
              }

              const deleteSql = `
                DELETE FROM Usuario
                WHERE id = ?;
              `;

              db.run(deleteSql, [id], function (errDelete) {
                if (errDelete) {
                  db.run("ROLLBACK;", () => {
                    db.close();
                    reject(errDelete);
                  });
                  return;
                }

                db.run("COMMIT;", (errCommit) => {
                  db.close();

                  if (errCommit) reject(errCommit);
                  else resolve({
                    deleted: true,
                    user: userRow,
                    deleted_at: deletedAt
                  });
                });
              });
            }
          );
        });
      });
    });
  });
}

