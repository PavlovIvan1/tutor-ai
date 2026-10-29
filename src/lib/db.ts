import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

/**
 * SQLite через better-sqlite3: синхронный, ~2 MB RAM.
 * WAL-режим — быстрые батч-апдейты на 1 CPU.
 */
const dbPath = process.env.TUTOR_DB_PATH ?? path.join(process.cwd(), "data", "tutor.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true }); // каталог может не существовать
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  _db = db;
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL DEFAULT '',
      yandex_id TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      completed_topics TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      transcript TEXT NOT NULL DEFAULT '',
      homework_md TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_student ON lessons(student_id);
  `);
  migrateStudentsLevel(db);
  migrateUsersYandex(db);
}

/** Лёгкая миграция: колонка уровня для уже существующих БД. */
function migrateUsersYandex(db: Database.Database) {
  const cols = db.pragma("table_info(users)") as Array<{ name: string }>;
  if (!cols.some((c) => c.name === "yandex_id")) {
    db.exec("ALTER TABLE users ADD COLUMN yandex_id TEXT NOT NULL DEFAULT ''");
  }
}

/** Лёгкая миграция: колонка уровня для уже существующих БД. */
function migrateStudentsLevel(db: Database.Database) {
  const cols = db.pragma("table_info(students)") as Array<{ name: string }>;
  if (!cols.some((c) => c.name === "level")) {
    db.exec("ALTER TABLE students ADD COLUMN level TEXT NOT NULL DEFAULT ''");
  }
}
