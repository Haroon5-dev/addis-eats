import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");

function dataPath(name) {
  return path.join(dataDirectory, name);
}

export function readLocalJson(name, fallback) {
  try {
    return JSON.parse(readFileSync(dataPath(name), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

export function writeLocalJson(name, value) {
  mkdirSync(dataDirectory, { recursive: true });
  const target = dataPath(name);
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temporary, target);
}
