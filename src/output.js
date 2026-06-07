"use strict";

// ── COLORS ────────────────────────────────────────────────────
const C = {
  reset:  "\x1b[0m",
  red:    "\x1b[31m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  white:  "\x1b[1;37m",
  dim:    "\x1b[2m",
  bold:   "\x1b[1m"
};

function ok(msg)   { console.log(`${C.green}[OK]${C.reset} ${msg}`); }
function err(msg)  { console.error(`${C.red}[ERR]${C.reset} ${msg}`); }
function info(msg) { console.log(`${C.cyan}[INFO]${C.reset} ${msg}`); }
function warn(msg) { console.log(`${C.yellow}[WARN]${C.reset} ${msg}`); }

function header(title) {
  console.log(`\n${C.cyan}${"─".repeat(50)}${C.reset}`);
  console.log(`${C.white} ${title}${C.reset}`);
  console.log(`${C.cyan}${"─".repeat(50)}${C.reset}\n`);
}

function table(headers, rows) {
  // Calculate column widths
  const widths = headers.map((h, i) => {
    const maxRow = Math.max(...rows.map(r => String(r[i] || "").length));
    return Math.max(h.length, maxRow);
  });

  // Header
  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join("  ");
  console.log(`${C.dim}${headerLine}${C.reset}`);
  console.log(`${C.dim}${"─".repeat(headerLine.length)}${C.reset}`);

  // Rows
  rows.forEach(row => {
    const line = row.map((cell, i) => String(cell || "").padEnd(widths[i])).join("  ");
    console.log(line);
  });

  console.log();
}

function statusColor(state) {
  switch (state) {
    case "running":  return `${C.green}● running${C.reset}`;
    case "starting": return `${C.yellow}◎ starting${C.reset}`;
    case "stopping": return `${C.yellow}◎ stopping${C.reset}`;
    case "offline":  return `${C.red}○ offline${C.reset}`;
    default:         return `${C.dim}? ${state}${C.reset}`;
  }
}

function bytesToHuman(b) {
  b = Number(b) || 0;
  if (b >= 1073741824) return `${(b/1073741824).toFixed(1)}GB`;
  if (b >= 1048576)    return `${(b/1048576).toFixed(1)}MB`;
  if (b >= 1024)       return `${(b/1024).toFixed(1)}KB`;
  return `${b}B`;
}

module.exports = { C, ok, err, info, warn, header, table, statusColor, bytesToHuman };
