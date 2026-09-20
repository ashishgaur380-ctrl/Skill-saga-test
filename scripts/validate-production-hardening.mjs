import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const read=(p)=>fs.readFileSync(p,"utf8");
const adminConfig=read("apps/admin/next.config.ts");
for (const header of ["X-Content-Type-Options","X-Frame-Options","Referrer-Policy","Permissions-Policy","Strict-Transport-Security"]) {
  assert.match(adminConfig,new RegExp(header.replaceAll("-","\\-")),"Missing admin security header: "+header);
}
assert.match(adminConfig,/async headers\(\)/);
assert.match(adminConfig,/reactStrictMode:\s*true/);

const tracked=[];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if([".git",".next","node_modules","out","lib"].includes(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(/\.(ts|tsx|js|mjs|json|yml|yaml|md|rules|env)$/.test(entry.name)) tracked.push(full);
  }
}
walk(".");
for(const file of tracked){
  const content=read(file);
  assert.doesNotMatch(content,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,"Potential private key material found in tracked file: "+file);
  assert.doesNotMatch(content,/"private_key"\s*:\s*"-----BEGIN/,"Potential service-account key found in tracked file: "+file);
}

const firebase=read("firebase.json");
const rules=read("security/firestore.rules");
const storage=read("security/storage.rules");
assert.match(firebase,/"firestore"\s*:/);
assert.match(firebase,/"storage"\s*:/);
assert.match(rules,/allow read, write: if false/);
assert.match(storage,/contentManager\(\)/);
assert.match(storage,/50 \* 1024 \* 1024/);
console.log("Skill Saga Phase 2 production-hardening validation passed.");
