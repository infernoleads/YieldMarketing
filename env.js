// server/src/config/env.js
// Imported FIRST in index.js so process.env is populated before any other
// module (token, prisma) reads from it. ESM evaluates imports in order.
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
