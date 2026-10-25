import type Database from "better-sqlite3";
import { getDb, todayISO } from "./db";

export function seedIfEmpty(db: Database.Database = getDb()) {
  const clients = db.prepare("SELECT COUNT(*) AS c FROM cliente").get() as {
    c: number;
  };
  if (clients.c > 0) return { seeded: false };

  const today = todayISO();

  const insertCliente = db.prepare(`
    INSERT INTO cliente (nome, morada, telefone, telemovel, c_postal, localidade, data_registo)
    VALUES (@nome, @morada, @telefone, @telemovel, @c_postal, @localidade, @data_registo)
  `);

  const clientes = [
    {
      nome: "João Ferreira",
      morada: "Rua das Oficinas 12",
      telefone: "253112233",
      telemovel: "912345678",
      c_postal: "4700-001",
      localidade: "Braga",
      data_registo: "2024-03-12",
    },
    {
      nome: "Maria Sousa",
      morada: "Av. da Liberdade 88",
      telefone: "222334455",
      telemovel: "934567890",
      c_postal: "4000-200",
      localidade: "Porto",
      data_registo: "2024-05-02",
    },
    {
      nome: "Transportes Norte Lda",
      morada: "Zona Industrial Lote 4",
      telefone: "253998877",
      telemovel: "961234567",
      c_postal: "4715-100",
      localidade: "Braga",
      data_registo: "2023-11-20",
    },
    {
      nome: "Ana Costa",
      morada: "Rua do Sol 45",
      telefone: "",
      telemovel: "918765432",
      c_postal: "4800-050",
      localidade: "Guimarães",
      data_registo: "2025-01-08",
    },
    {
      nome: "Pedro Mendes",
      morada: "Travessa do Pátio 3",
      telefone: "253445566",
      telemovel: "925551122",
      c_postal: "4700-320",
      localidade: "Braga",
      data_registo: "2024-09-15",
    },
  ];

  const clienteIds = clientes.map((c) => Number(insertCliente.run(c).lastInsertRowid));

  const insertEmpregado = db.prepare(`
    INSERT INTO empregado (
      nome_abreviado, nome, morada, telefone, telemovel, c_postal, localidade,
      utilizador, password, data_registo, categoria
    ) VALUES (
      @nome_abreviado, @nome, @morada, @telefone, @telemovel, @c_postal, @localidade,
      @utilizador, @password, @data_registo, @categoria
    )
  `);

  const empregados = [
    {
      nome_abreviado: "Rui",
      nome: "Rui Oliveira",
      morada: "Rua Nova 1",
      telefone: "253100100",
      telemovel: "910001111",
      c_postal: "4700-010",
      localidade: "Braga",
      utilizador: "rui",
      password: "demo",
      data_registo: "2022-01-10",
      categoria: "Mecânico",
    },
    {
      nome_abreviado: "Carla",
      nome: "Carla Pinto",
      morada: "Rua Velha 7",
      telefone: "253100200",
      telemovel: "920002222",
      c_postal: "4700-020",
      localidade: "Braga",
      utilizador: "carla",
      password: "demo",
      data_registo: "2023-04-01",
      categoria: "Receção",
    },
    {
      nome_abreviado: "Tiago",
      nome: "Tiago Lopes",
      morada: "Av. Central 19",
      telefone: "253100300",
      telemovel: "930003333",
      c_postal: "4700-030",
      localidade: "Braga",
      utilizador: "tiago",
      password: "demo",
      data_registo: "2021-06-15",
      categoria: "Chefe de oficina",
    },
  ];

  const empregadoIds = empregados.map((e) =>
    Number(insertEmpregado.run(e).lastInsertRowid)
  );

  const insertCarro = db.prepare(`
    INSERT INTO carro (matricula, marca, modelo, id_cliente, data_registo, kmsAviso, obs)
    VALUES (@matricula, @marca, @modelo, @id_cliente, @data_registo, @kmsAviso, @obs)
  `);

  const carros = [
    {
      matricula: "12-AB-34",
      marca: "Volkswagen",
      modelo: "Golf 1.6 TDI",
      id_cliente: clienteIds[0],
      data_registo: "2024-03-12",
      kmsAviso: 180000,
      obs: "Cliente habitual — revisão anual",
    },
    {
      matricula: "56-CD-78",
      marca: "Renault",
      modelo: "Clio IV",
      id_cliente: clienteIds[1],
      data_registo: "2024-05-02",
      kmsAviso: 95000,
      obs: "",
    },
    {
      matricula: "90-EF-12",
      marca: "Mercedes",
      modelo: "Sprinter 316",
      id_cliente: clienteIds[2],
      data_registo: "2023-11-20",
      kmsAviso: 320000,
      obs: "Frota empresa — prioridade",
    },
    {
      matricula: "34-GH-56",
      marca: "Toyota",
      modelo: "Yaris Hybrid",
      id_cliente: clienteIds[3],
      data_registo: "2025-01-08",
      kmsAviso: 42000,
      obs: "Primeira visita",
    },
    {
      matricula: "78-IJ-90",
      marca: "Peugeot",
      modelo: "308 SW",
      id_cliente: clienteIds[4],
      data_registo: "2024-09-15",
      kmsAviso: 140000,
      obs: "Barulho na suspensão dianteira",
    },
    {
      matricula: "11-KL-22",
      marca: "Ford",
      modelo: "Transit Custom",
      id_cliente: clienteIds[2],
      data_registo: "2024-02-01",
      kmsAviso: 210000,
      obs: "",
    },
  ];

  carros.forEach((c) => insertCarro.run(c));

  const insertMaterial = db.prepare(`
    INSERT INTO material (codigo, descricao, preco, iva, preco_iva, data_registo, tipo)
    VALUES (@codigo, @descricao, @preco, @iva, @preco_iva, @data_registo, @tipo)
  `);

  const materiais = [
    { codigo: "OL-5W30", descricao: "Óleo motor 5W30 5L", preco: 28.5, iva: 23, tipo: "Lubrificante" },
    { codigo: "FIL-OLE", descricao: "Filtro de óleo", preco: 9.8, iva: 23, tipo: "Filtro" },
    { codigo: "FIL-AR", descricao: "Filtro de ar", preco: 14.2, iva: 23, tipo: "Filtro" },
    { codigo: "PAST-FR", descricao: "Pastilhas travão dianteiras", preco: 45.0, iva: 23, tipo: "Travões" },
    { codigo: "DISC-FR", descricao: "Discos de travão (par)", preco: 78.0, iva: 23, tipo: "Travões" },
    { codigo: "MO-HORA", descricao: "Mão de obra / hora", preco: 35.0, iva: 23, tipo: "Serviço" },
    { codigo: "BAT-12V", descricao: "Bateria 12V 60Ah", preco: 95.0, iva: 23, tipo: "Elétrica" },
    { codigo: "COR-DIST", descricao: "Kit correia distribuição", preco: 165.0, iva: 23, tipo: "Motor" },
  ].map((m) => ({
    ...m,
    preco_iva: Number((m.preco * (1 + m.iva / 100)).toFixed(2)),
    data_registo: today,
  }));

  materiais.forEach((m) => insertMaterial.run(m));

  const insertDespesa = db.prepare(`
    INSERT INTO despesas (codigo, descricao, custo, iva, custo_iva, data_registo, tipo_custo)
    VALUES (@codigo, @descricao, @custo, @iva, @custo_iva, @data_registo, @tipo_custo)
  `);

  [
    { codigo: "ALUG", descricao: "Renda da oficina — março", custo: 850, iva: 23, tipo_custo: "Instalações", data_registo: "2025-03-01" },
    { codigo: "ELET", descricao: "Eletricidade", custo: 210.45, iva: 23, tipo_custo: "Utilities", data_registo: "2025-03-05" },
    { codigo: "FERR", descricao: "Chave dinamométrica", custo: 120, iva: 23, tipo_custo: "Ferramentas", data_registo: "2025-02-18" },
    { codigo: "SEGU", descricao: "Seguro responsabilidade civil", custo: 340, iva: 0, tipo_custo: "Seguros", data_registo: "2025-01-15" },
  ].forEach((d) =>
    insertDespesa.run({
      ...d,
      custo_iva: Number((d.custo * (1 + d.iva / 100)).toFixed(2)),
    })
  );

  // Ordem de reparação 1
  const or1 = db
    .prepare(
      `INSERT INTO documento_or (
        tipo_documento, n_documento, data_documento, tempo_previsto, tempo_final, tempo, estado,
        carro_matricula, marca, modelo, id_cliente, nome, morada, telefone, telemovel, c_postal, localidade,
        kms, observacao, total, convertido, total_geral_sem_iva
      ) VALUES (
        'OR', 1001, '2025-03-10', 3.5, NULL, 2.0, 'Em curso',
        '12-AB-34', 'Volkswagen', 'Golf 1.6 TDI', @id_cliente, 'João Ferreira',
        'Rua das Oficinas 12', '253112233', '912345678', '4700-001', 'Braga',
        '178450', 'Revisão + pastilhas', 0, 0, 0
      )`
    )
    .run({ id_cliente: clienteIds[0] });

  const or1Id = Number(or1.lastInsertRowid);
  const linhasOr = [
    {
      linha: 1,
      c_artigo: "OL-5W30",
      descricao: "Óleo motor 5W30 5L",
      quantidade: 1,
      preco_unitario: 28.5,
      iva: 23,
      id_empregado: empregadoIds[0],
      nome_empregado_mo: "Rui",
      tipo_material: "Lubrificante",
    },
    {
      linha: 2,
      c_artigo: "FIL-OLE",
      descricao: "Filtro de óleo",
      quantidade: 1,
      preco_unitario: 9.8,
      iva: 23,
      id_empregado: empregadoIds[0],
      nome_empregado_mo: "Rui",
      tipo_material: "Filtro",
    },
    {
      linha: 3,
      c_artigo: "PAST-FR",
      descricao: "Pastilhas travão dianteiras",
      quantidade: 1,
      preco_unitario: 45.0,
      iva: 23,
      id_empregado: empregadoIds[0],
      nome_empregado_mo: "Rui",
      tipo_material: "Travões",
    },
    {
      linha: 4,
      c_artigo: "MO-HORA",
      descricao: "Mão de obra / hora",
      quantidade: 2.5,
      preco_unitario: 35.0,
      iva: 23,
      id_empregado: empregadoIds[0],
      nome_empregado_mo: "Rui",
      tipo_material: "Serviço",
    },
  ];

  const insertLinhaOr = db.prepare(`
    INSERT INTO linhas_documento_or (
      linha, c_artigo, descricao, quantidade, preco_unitario, iva, preco_linha,
      id_documento, id_empregado, data_linha, nome_empregado_mo, preco_linha_sem_iva, tipo_material
    ) VALUES (
      @linha, @c_artigo, @descricao, @quantidade, @preco_unitario, @iva, @preco_linha,
      @id_documento, @id_empregado, @data_linha, @nome_empregado_mo, @preco_linha_sem_iva, @tipo_material
    )
  `);

  let totalOr = 0;
  let totalOrSem = 0;
  for (const l of linhasOr) {
    const sem = Number((l.quantidade * l.preco_unitario).toFixed(2));
    const com = Number((sem * (1 + l.iva / 100)).toFixed(2));
    totalOrSem += sem;
    totalOr += com;
    insertLinhaOr.run({
      ...l,
      id_documento: or1Id,
      data_linha: "2025-03-10",
      preco_linha_sem_iva: sem,
      preco_linha: com,
    });
  }
  db.prepare(
    "UPDATE documento_or SET total = ?, total_geral_sem_iva = ? WHERE id_documento = ?"
  ).run(totalOr, totalOrSem, or1Id);

  // Ordem concluída
  const or2 = db
    .prepare(
      `INSERT INTO documento_or (
        tipo_documento, n_documento, data_documento, tempo_previsto, tempo_final, tempo, estado,
        carro_matricula, marca, modelo, id_cliente, nome, morada, telefone, telemovel, c_postal, localidade,
        kms, observacao, total, convertido, total_geral_sem_iva
      ) VALUES (
        'OR', 1002, '2025-02-20', 1.5, 1.5, 1.5, 'Concluída',
        '56-CD-78', 'Renault', 'Clio IV', @id_cliente, 'Maria Sousa',
        'Av. da Liberdade 88', '222334455', '934567890', '4000-200', 'Porto',
        '94800', 'Substituição de bateria', 116.85, 1, 95.0
      )`
    )
    .run({ id_cliente: clienteIds[1] });

  const or2Id = Number(or2.lastInsertRowid);
  insertLinhaOr.run({
    linha: 1,
    c_artigo: "BAT-12V",
    descricao: "Bateria 12V 60Ah",
    quantidade: 1,
    preco_unitario: 95.0,
    iva: 23,
    preco_linha: 116.85,
    id_documento: or2Id,
    id_empregado: empregadoIds[2],
    data_linha: "2025-02-20",
    nome_empregado_mo: "Tiago",
    preco_linha_sem_iva: 95.0,
    tipo_material: "Elétrica",
  });

  // Fatura convertida da OR 1002
  const fo1 = db
    .prepare(
      `INSERT INTO documento_fo (
        tipo_documento, n_documento, data_documento, tempo_previsto, tempo_final, tempo, estado,
        carro_matricula, marca, modelo, id_cliente, nome, morada, telefone, telemovel, c_postal, localidade,
        kms, observacao, total, convertido, total_geral_sem_iva, total_compra, total_compra_sem_iva
      ) VALUES (
        'FO', 5001, '2025-02-21', 1.5, 1.5, 1.5, 'Paga',
        '56-CD-78', 'Renault', 'Clio IV', @id_cliente, 'Maria Sousa',
        'Av. da Liberdade 88', '222334455', '934567890', '4000-200', 'Porto',
        '94800', 'Fatura OR 1002', 116.85, 1, 95.0, 70.0, 56.91
      )`
    )
    .run({ id_cliente: clienteIds[1] });

  const fo1Id = Number(fo1.lastInsertRowid);
  db.prepare(`
    INSERT INTO linhas_documento_fo (
      linha, c_artigo, descricao, quantidade, preco_unitario, iva, preco_linha,
      id_documento, id_empregado, data_linha, nome_empregado_mo, preco_linha_sem_iva,
      preco_compra, preco_compra_total, preco_compra_total_sem_iva, iva_compra, tipo_material
    ) VALUES (
      1, 'BAT-12V', 'Bateria 12V 60Ah', 1, 95.0, 23, 116.85,
      @id_documento, @id_empregado, '2025-02-21', 'Tiago', 95.0,
      56.91, 70.0, 56.91, 23, 'Elétrica'
    )
  `).run({ id_documento: fo1Id, id_empregado: empregadoIds[2] });

  // Segunda fatura em aberto
  const fo2 = db
    .prepare(
      `INSERT INTO documento_fo (
        tipo_documento, n_documento, data_documento, estado,
        carro_matricula, marca, modelo, id_cliente, nome, morada, telefone, telemovel, c_postal, localidade,
        kms, observacao, total, convertido, total_geral_sem_iva, total_compra, total_compra_sem_iva
      ) VALUES (
        'FO', 5002, '2025-03-12', 'Emitida',
        '90-EF-12', 'Mercedes', 'Sprinter 316', @id_cliente, 'Transportes Norte Lda',
        'Zona Industrial Lote 4', '253998877', '961234567', '4715-100', 'Braga',
        '319200', 'Manutenção frota', 246.0, 0, 200.0, 0, 0
      )`
    )
    .run({ id_cliente: clienteIds[2] });

  const fo2Id = Number(fo2.lastInsertRowid);
  db.prepare(`
    INSERT INTO linhas_documento_fo (
      linha, c_artigo, descricao, quantidade, preco_unitario, iva, preco_linha,
      id_documento, id_empregado, data_linha, nome_empregado_mo, preco_linha_sem_iva,
      preco_compra, preco_compra_total, preco_compra_total_sem_iva, iva_compra, tipo_material
    ) VALUES
      (1, 'MO-HORA', 'Mão de obra / hora', 4, 35.0, 23, 172.2, @id, @emp, '2025-03-12', 'Rui', 140.0, 0, 0, 0, 23, 'Serviço'),
      (2, 'FIL-AR', 'Filtro de ar', 1, 14.2, 23, 17.47, @id, @emp, '2025-03-12', 'Rui', 14.2, 8.0, 9.84, 8.0, 23, 'Filtro'),
      (3, 'OL-5W30', 'Óleo motor 5W30 5L', 1, 28.5, 23, 35.06, @id, @emp, '2025-03-12', 'Rui', 28.5, 18.0, 22.14, 18.0, 23, 'Lubrificante')
  `).run({ id: fo2Id, emp: empregadoIds[0] });

  db.prepare(
    "UPDATE documento_fo SET total = 224.73, total_geral_sem_iva = 182.7 WHERE id_documento = ?"
  ).run(fo2Id);

  // Documento de despesas
  const de1 = db
    .prepare(
      `INSERT INTO documento_de (n_documento, data_documento, estado, observacao, total, total_sem_iva)
       VALUES (3001, '2025-03-05', 'Registado', 'Despesas mensais oficina', 0, 0)`
    )
    .run();
  const de1Id = Number(de1.lastInsertRowid);

  const insertLinhaDe = db.prepare(`
    INSERT INTO linhas_documento_de (
      linha, codigo, descricao, quantidade, custo_unitario, iva, custo_linha,
      custo_linha_sem_iva, id_documento, id_empregado, data_linha, nome_empregado_mo, tipo_despesa
    ) VALUES (
      @linha, @codigo, @descricao, @quantidade, @custo_unitario, @iva, @custo_linha,
      @custo_linha_sem_iva, @id_documento, @id_empregado, @data_linha, @nome_empregado_mo, @tipo_despesa
    )
  `);

  const linhasDe = [
    {
      linha: 1,
      codigo: "ELET",
      descricao: "Eletricidade",
      quantidade: 1,
      custo_unitario: 210.45,
      iva: 23,
      tipo_despesa: "Utilities",
    },
    {
      linha: 2,
      codigo: "ALUG",
      descricao: "Renda da oficina — março",
      quantidade: 1,
      custo_unitario: 850,
      iva: 23,
      tipo_despesa: "Instalações",
    },
  ];

  let totalDe = 0;
  let totalDeSem = 0;
  for (const l of linhasDe) {
    const sem = Number((l.quantidade * l.custo_unitario).toFixed(2));
    const com = Number((sem * (1 + l.iva / 100)).toFixed(2));
    totalDeSem += sem;
    totalDe += com;
    insertLinhaDe.run({
      ...l,
      id_documento: de1Id,
      id_empregado: empregadoIds[1],
      data_linha: "2025-03-05",
      nome_empregado_mo: "Carla",
      custo_linha_sem_iva: sem,
      custo_linha: com,
    });
  }
  db.prepare(
    "UPDATE documento_de SET total = ?, total_sem_iva = ? WHERE id_documento = ?"
  ).run(totalDe, totalDeSem, de1Id);

  // Ordem aberta Sprinter
  db.prepare(
    `INSERT INTO documento_or (
      tipo_documento, n_documento, data_documento, tempo_previsto, estado,
      carro_matricula, marca, modelo, id_cliente, nome, morada, telefone, telemovel, c_postal, localidade,
      kms, observacao, total, convertido, total_geral_sem_iva
    ) VALUES (
      'OR', 1003, '2025-03-18', 8.0, 'Aberta',
      '90-EF-12', 'Mercedes', 'Sprinter 316', ?, 'Transportes Norte Lda',
      'Zona Industrial Lote 4', '253998877', '961234567', '4715-100', 'Braga',
      '320100', 'Kit distribuição + revisão', 0, 0, 0
    )`
  ).run(clienteIds[2]);

  return { seeded: true };
}
