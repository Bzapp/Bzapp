"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, todayISO } from "./db";
import { seedIfEmpty } from "./seed";

function ensureSeeded() {
  seedIfEmpty(getDb());
}

export async function createCliente(formData: FormData) {
  ensureSeeded();
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO cliente (nome, morada, telefone, telemovel, c_postal, localidade, data_registo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(formData.get("nome") || ""),
      String(formData.get("morada") || ""),
      String(formData.get("telefone") || ""),
      String(formData.get("telemovel") || ""),
      String(formData.get("c_postal") || ""),
      String(formData.get("localidade") || ""),
      todayISO()
    );
  revalidatePath("/clientes");
  redirect(`/clientes/${result.lastInsertRowid}`);
}

export async function createCarro(formData: FormData) {
  ensureSeeded();
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO carro (matricula, marca, modelo, id_cliente, data_registo, kmsAviso, obs)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(formData.get("matricula") || "").toUpperCase(),
      String(formData.get("marca") || ""),
      String(formData.get("modelo") || ""),
      Number(formData.get("id_cliente") || 0),
      todayISO(),
      Number(formData.get("kmsAviso") || 0),
      String(formData.get("obs") || "")
    );
  revalidatePath("/carros");
  redirect(`/carros/${result.lastInsertRowid}`);
}

export async function createMaterial(formData: FormData) {
  ensureSeeded();
  const db = getDb();
  const preco = Number(formData.get("preco") || 0);
  const iva = Number(formData.get("iva") || 23);
  const preco_iva = Number((preco * (1 + iva / 100)).toFixed(2));
  const result = db
    .prepare(
      `INSERT INTO material (codigo, descricao, preco, iva, preco_iva, data_registo, tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(formData.get("codigo") || ""),
      String(formData.get("descricao") || ""),
      preco,
      iva,
      preco_iva,
      todayISO(),
      String(formData.get("tipo") || "Geral")
    );
  revalidatePath("/materiais");
  redirect(`/materiais/${result.lastInsertRowid}`);
}

export async function createDespesa(formData: FormData) {
  ensureSeeded();
  const db = getDb();
  const custo = Number(formData.get("custo") || 0);
  const iva = Number(formData.get("iva") || 23);
  const custo_iva = Number((custo * (1 + iva / 100)).toFixed(2));
  const result = db
    .prepare(
      `INSERT INTO despesas (codigo, descricao, custo, iva, custo_iva, data_registo, tipo_custo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(formData.get("codigo") || ""),
      String(formData.get("descricao") || ""),
      custo,
      iva,
      custo_iva,
      todayISO(),
      String(formData.get("tipo_custo") || "Geral")
    );
  revalidatePath("/despesas");
  redirect(`/despesas/${result.lastInsertRowid}`);
}

export async function createOrdem(formData: FormData) {
  ensureSeeded();
  const db = getDb();
  const idCliente = Number(formData.get("id_cliente") || 0);
  const matricula = String(formData.get("carro_matricula") || "");
  const cliente = db
    .prepare("SELECT * FROM cliente WHERE id_cliente = ?")
    .get(idCliente) as Record<string, unknown> | undefined;
  const carro = db
    .prepare("SELECT * FROM carro WHERE matricula = ?")
    .get(matricula) as Record<string, unknown> | undefined;

  const nextNum =
    (
      db
        .prepare("SELECT COALESCE(MAX(n_documento), 1000) + 1 AS n FROM documento_or")
        .get() as { n: number }
    ).n ?? 1001;

  const result = db
    .prepare(
      `INSERT INTO documento_or (
        tipo_documento, n_documento, data_documento, tempo_previsto, estado,
        carro_matricula, marca, modelo, id_cliente, nome, morada, telefone, telemovel, c_postal, localidade,
        kms, observacao, total, convertido, total_geral_sem_iva
      ) VALUES (
        'OR', ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, 0, 0, 0
      )`
    )
    .run(
      nextNum,
      todayISO(),
      Number(formData.get("tempo_previsto") || 0) || null,
      String(formData.get("estado") || "Aberta"),
      matricula,
      String(carro?.marca || formData.get("marca") || ""),
      String(carro?.modelo || formData.get("modelo") || ""),
      idCliente,
      String(cliente?.nome || ""),
      String(cliente?.morada || ""),
      String(cliente?.telefone || ""),
      String(cliente?.telemovel || ""),
      String(cliente?.c_postal || ""),
      String(cliente?.localidade || ""),
      String(formData.get("kms") || ""),
      String(formData.get("observacao") || "")
    );

  revalidatePath("/ordens");
  redirect(`/ordens/${result.lastInsertRowid}`);
}

export async function createFatura(formData: FormData) {
  ensureSeeded();
  const db = getDb();
  const idCliente = Number(formData.get("id_cliente") || 0);
  const matricula = String(formData.get("carro_matricula") || "");
  const cliente = db
    .prepare("SELECT * FROM cliente WHERE id_cliente = ?")
    .get(idCliente) as Record<string, unknown> | undefined;
  const carro = db
    .prepare("SELECT * FROM carro WHERE matricula = ?")
    .get(matricula) as Record<string, unknown> | undefined;

  const nextNum =
    (
      db
        .prepare("SELECT COALESCE(MAX(n_documento), 5000) + 1 AS n FROM documento_fo")
        .get() as { n: number }
    ).n ?? 5001;

  const result = db
    .prepare(
      `INSERT INTO documento_fo (
        tipo_documento, n_documento, data_documento, estado,
        carro_matricula, marca, modelo, id_cliente, nome, morada, telefone, telemovel, c_postal, localidade,
        kms, observacao, total, convertido, total_geral_sem_iva, total_compra, total_compra_sem_iva
      ) VALUES (
        'FO', ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, 0, 0, 0, 0, 0
      )`
    )
    .run(
      nextNum,
      todayISO(),
      String(formData.get("estado") || "Emitida"),
      matricula,
      String(carro?.marca || ""),
      String(carro?.modelo || ""),
      idCliente,
      String(cliente?.nome || ""),
      String(cliente?.morada || ""),
      String(cliente?.telefone || ""),
      String(cliente?.telemovel || ""),
      String(cliente?.c_postal || ""),
      String(cliente?.localidade || ""),
      String(formData.get("kms") || ""),
      String(formData.get("observacao") || "")
    );

  revalidatePath("/faturas");
  redirect(`/faturas/${result.lastInsertRowid}`);
}
