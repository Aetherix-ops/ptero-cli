"use strict";

const { PteroApp } = require("@aetherix-ops/ptero-api");
const { requireConfig } = require("../config");
const { ok, err, info, header, table, C } = require("../output");

module.exports = function(program) {
  const node = program
    .command("node")
    .description("Manage Pterodactyl nodes (admin)");

  // ── LIST ──────────────────────────────────────────────────
  node
    .command("list")
    .alias("ls")
    .description("List all nodes")
    .action(async () => {
      const cfg = requireConfig();
      const app = new PteroApp(cfg.panelUrl, cfg.appKey || cfg.clientKey);

      try {
        header("Nodes");
        const res = await app.listNodes();
        const nodes = res?.data || [];

        if (nodes.length === 0) {
          info("No nodes found.");
          return;
        }

        const rows = nodes.map(n => {
          const a = n.attributes;
          const ramUsed = Math.round((a.allocated_resources?.memory || 0) / 1024);
          const ramTotal = Math.round(a.memory / 1024);
          const diskUsed = Math.round((a.allocated_resources?.disk || 0) / 1024);
          const diskTotal = Math.round(a.disk / 1024);
          return [
            a.id,
            a.name,
            a.fqdn,
            `${ramUsed}/${ramTotal}GB`,
            `${diskUsed}/${diskTotal}GB`,
            a.maintenance_mode ? `${C.yellow}maintenance${C.reset}` : `${C.green}online${C.reset}`
          ];
        });

        table(["ID", "NAME", "FQDN", "RAM", "DISK", "STATUS"], rows);
        console.log(`${C.dim}Total: ${nodes.length} nodes${C.reset}`);
      } catch (e) {
        err(e.message);
      }
    });

  // ── INFO ──────────────────────────────────────────────────
  node
    .command("info <id>")
    .description("Get node details")
    .action(async (id) => {
      const cfg = requireConfig();
      const app = new PteroApp(cfg.panelUrl, cfg.appKey || cfg.clientKey);

      try {
        const res = await app.getNode(id);
        const n = res?.attributes || {};

        header(`Node: ${n.name}`);
        console.log(`  ID          : ${n.id}`);
        console.log(`  Name        : ${C.white}${n.name}${C.reset}`);
        console.log(`  FQDN        : ${n.fqdn}`);
        console.log(`  Memory      : ${Math.round(n.memory/1024)}GB (overalloc: ${n.memory_overallocate}%)`);
        console.log(`  Disk        : ${Math.round(n.disk/1024)}GB (overalloc: ${n.disk_overallocate}%)`);
        console.log(`  Wings Port  : ${n.daemon_listen}`);
        console.log(`  SFTP Port   : ${n.daemon_sftp}`);
        console.log(`  Maintenance : ${n.maintenance_mode ? `${C.yellow}yes${C.reset}` : "no"}`);
        console.log();
      } catch (e) {
        err(e.message);
      }
    });
};
