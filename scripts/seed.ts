import { getDb } from "../src/lib/db";
import { seedIfEmpty } from "../src/lib/seed";

const db = getDb();
const result = seedIfEmpty(db);
console.log(result.seeded ? "Base de dados preenchida com dados de demonstração." : "Base de dados já tinha dados — seed ignorado.");
