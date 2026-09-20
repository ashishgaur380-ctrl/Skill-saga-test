import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const tracked = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".next", "node_modules", "out", "lib"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|mjs|json|yml|yaml|md|rules|env)$/.test(entry.name)) tracked.push(full);
  }
}
walk(".");
const forbidden = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /"private_key"\s*:\s*"-----BEGIN/,
];
for (const file of tracked) {
  const content = fs.readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    assert.doesNotMatch(content, pattern, "Potential private key material found in tracked file: " + file);
  }
}

const firebase = fs.readFileSync("firebase.json", "utf8");
const rules = fs.readFileSync("security/firestore.rules", "utf8");
const storage = fs.readFileSync("security/storage.rules", "utf8");
assert.match(firebase, /"firestore"\s*:/);
assert.match(firebase, /"storage"\s*:/);
assert.match(rules, /allow read, write: if false/);
assert.match(storage, /contentManager\(\)/);
assert.match(storage, /50 \* 1024 \* 1024/);

console.log("Skill Saga Phase 2 production-hardening validation passed.");
