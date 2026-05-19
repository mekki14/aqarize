import fs from "fs";
import { execSync } from "child_process";

const hbaPath = "C:/Program Files/PostgreSQL/18/data/pg_hba.conf";
const bakPath = "C:/Program Files/PostgreSQL/18/data/pg_hba.conf.fixbak";

// Backup
fs.copyFileSync(hbaPath, bakPath);

// Read and replace auth methods with trust
let content = fs.readFileSync(hbaPath, "utf8");
content = content.replace(/^(host\s+all\s+all\s+127\.0\.0\.1\/32\s+)\S+/m, "$1trust");
content = content.replace(/^(host\s+all\s+all\s+::1\/128\s+)\S+/m, "$1trust");
content = content.replace(/^(local\s+all\s+all\s+)\S+/m, "$1trust");

fs.writeFileSync(hbaPath, content, "utf8");
console.log("Written pg_hba.conf with trust auth");

// Reload PostgreSQL
try {
  execSync('"C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe" reload -D "C:/Program Files/PostgreSQL/18/data"', {
    encoding: "utf8",
    timeout: 10000,
  });
  console.log("PostgreSQL reloaded");
} catch (e) {
  console.error("Reload error:", e.message);
}
