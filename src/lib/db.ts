import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "mecanica.db");

declare global {
  // eslint-disable-next-line no-var
  var __mecanicaDb: Database.Database | undefined;
}

function createSchema(db: Database.Database) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS cliente (
      id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      morada TEXT,
      telefone TEXT,
      telemovel TEXT,
      c_postal TEXT,
      localidade TEXT,
      data_registo TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS carro (
      id_matricula INTEGER PRIMARY KEY AUTOINCREMENT,
      matricula TEXT NOT NULL UNIQUE,
      marca TEXT,
      modelo TEXT,
      id_cliente INTEGER NOT NULL DEFAULT 0,
      data_registo TEXT NOT NULL,
      kmsAviso INTEGER NOT NULL DEFAULT 0,
      obs TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
    );

    CREATE TABLE IF NOT EXISTS empregado (
      id_empregado INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_abreviado TEXT NOT NULL,
      nome TEXT NOT NULL,
      morada TEXT NOT NULL DEFAULT '',
      telefone TEXT NOT NULL DEFAULT '',
      telemovel TEXT NOT NULL DEFAULT '',
      c_postal TEXT NOT NULL DEFAULT '',
      localidade TEXT NOT NULL DEFAULT '',
      utilizador TEXT NOT NULL,
      password TEXT NOT NULL DEFAULT '',
      data_registo TEXT NOT NULL,
      categoria TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS material (
      id_material INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT,
      descricao TEXT,
      preco REAL NOT NULL,
      iva REAL NOT NULL DEFAULT 23,
      preco_iva REAL NOT NULL,
      data_registo TEXT NOT NULL,
      tipo TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS despesas (
      id_despesa INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT,
      descricao TEXT,
      custo REAL NOT NULL,
      iva REAL NOT NULL DEFAULT 23,
      custo_iva REAL NOT NULL,
      data_registo TEXT NOT NULL,
      tipo_custo TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documento_or (
      id_documento INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_documento TEXT NOT NULL DEFAULT 'OR',
      n_documento INTEGER NOT NULL,
      data_documento TEXT,
      tempo_previsto REAL,
      tempo_final REAL,
      tempo REAL,
      estado TEXT,
      carro_matricula TEXT NOT NULL,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      id_cliente INTEGER NOT NULL,
      nome TEXT NOT NULL,
      morada TEXT NOT NULL DEFAULT '',
      telefone TEXT NOT NULL DEFAULT '',
      telemovel TEXT NOT NULL DEFAULT '',
      c_postal TEXT NOT NULL DEFAULT '',
      localidade TEXT NOT NULL DEFAULT '',
      kms TEXT,
      observacao TEXT,
      total REAL NOT NULL DEFAULT 0,
      convertido INTEGER NOT NULL DEFAULT 0,
      total_geral_sem_iva REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS linhas_documento_or (
      linha INTEGER NOT NULL,
      c_artigo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      quantidade REAL,
      preco_unitario REAL,
      iva REAL NOT NULL DEFAULT 23,
      preco_linha REAL NOT NULL,
      id_documento INTEGER NOT NULL,
      id_empregado INTEGER NOT NULL,
      data_linha TEXT,
      nome_empregado_mo TEXT NOT NULL,
      preco_linha_sem_iva REAL NOT NULL,
      tipo_material TEXT NOT NULL,
      PRIMARY KEY (id_documento, linha),
      FOREIGN KEY (id_documento) REFERENCES documento_or(id_documento)
    );

    CREATE TABLE IF NOT EXISTS documento_fo (
      id_documento INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_documento TEXT NOT NULL DEFAULT 'FO',
      n_documento INTEGER NOT NULL,
      data_documento TEXT,
      tempo_previsto REAL,
      tempo_final REAL,
      tempo REAL,
      estado TEXT,
      carro_matricula TEXT NOT NULL,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      id_cliente INTEGER NOT NULL,
      nome TEXT NOT NULL,
      morada TEXT NOT NULL DEFAULT '',
      telefone TEXT NOT NULL DEFAULT '',
      telemovel TEXT NOT NULL DEFAULT '',
      c_postal TEXT NOT NULL DEFAULT '',
      localidade TEXT NOT NULL DEFAULT '',
      kms TEXT,
      observacao TEXT,
      total REAL NOT NULL DEFAULT 0,
      convertido INTEGER NOT NULL DEFAULT 0,
      total_geral_sem_iva REAL NOT NULL DEFAULT 0,
      total_compra REAL NOT NULL DEFAULT 0,
      total_compra_sem_iva REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS linhas_documento_fo (
      linha INTEGER NOT NULL,
      c_artigo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      quantidade REAL,
      preco_unitario REAL,
      iva REAL NOT NULL DEFAULT 23,
      preco_linha REAL NOT NULL,
      id_documento INTEGER NOT NULL,
      id_empregado INTEGER NOT NULL,
      data_linha TEXT,
      nome_empregado_mo TEXT NOT NULL,
      preco_linha_sem_iva REAL NOT NULL,
      preco_compra REAL,
      preco_compra_total REAL,
      preco_compra_total_sem_iva REAL,
      iva_compra REAL NOT NULL DEFAULT 23,
      tipo_material TEXT NOT NULL,
      PRIMARY KEY (id_documento, linha),
      FOREIGN KEY (id_documento) REFERENCES documento_fo(id_documento)
    );

    CREATE TABLE IF NOT EXISTS documento_de (
      id_documento INTEGER PRIMARY KEY AUTOINCREMENT,
      n_documento INTEGER NOT NULL,
      data_documento TEXT,
      estado TEXT,
      observacao TEXT,
      total REAL NOT NULL DEFAULT 0,
      total_sem_iva REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS linhas_documento_de (
      linha INTEGER NOT NULL,
      codigo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      quantidade REAL,
      custo_unitario REAL,
      iva REAL NOT NULL DEFAULT 23,
      custo_linha REAL,
      custo_linha_sem_iva REAL,
      id_documento INTEGER NOT NULL,
      id_empregado INTEGER NOT NULL,
      data_linha TEXT,
      nome_empregado_mo TEXT NOT NULL,
      tipo_despesa TEXT NOT NULL,
      PRIMARY KEY (id_documento, linha),
      FOREIGN KEY (id_documento) REFERENCES documento_de(id_documento)
    );
  `);
}

export function getDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!globalThis.__mecanicaDb) {
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    createSchema(db);
    globalThis.__mecanicaDb = db;
  }

  return globalThis.__mecanicaDb;
}

export function euro(value: number | null | undefined) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("pt-PT").format(d);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
