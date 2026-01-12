CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_deletions_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      deleted_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS Productos (
      CREATE TABLE IF NOT EXISTS Productos (
      id INTEGER PRIMARY KEY,
      Producto TEXT NOT NULL,
      Precio TEXT NOT NULL,
      Stock TEXT NOT NULL
    );