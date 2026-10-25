# Mecânica — gestão de oficina

Aplicação full-stack em português para oficina mecânica, espelhando o domínio do esquema MySQL `mecanica` (clientes, viaturas, materiais, empregados, ordens OR, faturas FO e despesas DE).

Stack: **Next.js 15 + TypeScript + SQLite** (`better-sqlite3`). Sem MySQL — corre localmente com dados de demonstração.

## Como correr

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Na primeira visita, a base SQLite em `data/mecanica.db` é criada e preenchida automaticamente com dados de exemplo.

Scripts úteis:

```bash
npm run seed      # força o seed se a BD estiver vazia
npm run db:reset  # apaga a BD e volta a semear
```

## Funcionalidades

| Área | Rotas |
|------|--------|
| Painel | `/` |
| Clientes | `/clientes`, `/clientes/novo`, `/clientes/[id]` |
| Viaturas | `/carros`, `/carros/novo`, `/carros/[id]` |
| Materiais | `/materiais`, `/materiais/novo`, `/materiais/[id]` |
| Ordens (OR) | `/ordens`, `/ordens/nova`, `/ordens/[id]` |
| Faturas (FO) | `/faturas`, `/faturas/nova`, `/faturas/[id]` |
| Despesas | `/despesas`, catálogo + documentos DE |
| Equipa | `/empregados` |

## Domínio (schema)

Tabelas espelhadas do phpMyAdmin: `cliente`, `carro`, `empregado`, `material`, `despesas`, `documento_or` / `linhas_documento_or`, `documento_fo` / `linhas_documento_fo`, `documento_de` / `linhas_documento_de`.
