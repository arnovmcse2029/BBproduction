import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const envPath = resolve(root, ".env.supabase-local");
const require = createRequire(import.meta.url);

function readEnvValue(contents, name) {
  const line = contents.split(/\r?\n/).find((entry) => new RegExp(`^\\s*${name}\\s*=`).test(entry));
  if (!line) return "";
  return line
    .slice(line.indexOf("=") + 1)
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2");
}

let contents;
try {
  contents = readFileSync(envPath, "utf8");
} catch {
  console.error("Create .env.supabase-local from .env.supabase-local.example before starting.");
  process.exit(1);
}

const url = readEnvValue(contents, "VITE_SUPABASE_URL");
const key = readEnvValue(contents, "VITE_SUPABASE_PUBLISHABLE_KEY");
let endpoint;
try {
  endpoint = new URL(url);
} catch {
  endpoint = null;
}

if (
  !endpoint ||
  endpoint.protocol !== "http:" ||
  !["127.0.0.1", "localhost"].includes(endpoint.hostname) ||
  endpoint.port !== "54321" ||
  !key ||
  /replace_with|your_local/i.test(key)
) {
  console.error(
    ".env.supabase-local must contain the local Supabase URL and generated anon/publishable key.",
  );
  process.exit(1);
}

const jwtPayload = key.split(".")[1];
if (jwtPayload) {
  try {
    if (JSON.parse(Buffer.from(jwtPayload, "base64url").toString("utf8")).role === "service_role") {
      console.error("Do not use a service-role key in the browser environment.");
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("The local Supabase key is not a valid publishable/anon key.");
      process.exit(1);
    }
    throw error;
  }
}

console.log("Local Supabase environment validated; starting Vite in supabase-local mode.");
const vite = spawn(
  process.execPath,
  [require.resolve("vite/bin/vite.js"), "--mode", "supabase-local"],
  { cwd: root, stdio: "inherit" },
);
vite.on("error", (error) => {
  console.error("Unable to start Vite.", error.message);
  process.exitCode = 1;
});
vite.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
