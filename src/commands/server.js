"use strict";

const { PteroClient, PteroApp } = require("@aetherix-ops/ptero-api");
const { requireConfig } = require("../config");
const { ok, err, info, warn, header, table, statusColor, bytesToHuman, C } = require("../output");

module.exports = function(program) {
  const server = program
    .command("server")
    .description("Manage Pterodactyl servers");

  // ── LIST ──────────────────────────────────────────────────
  server
    .command("list")
    .alias("ls")
    .description("List all servers")
    .option("-s, --stats", "Show RAM/CPU stats")
    .action(async (opts) => {
      const cfg = requireConfig();
      const client = new PteroClient(cfg.panelUrl, cfg.clientKey);

      try {
        header("Servers");
        const res = await client.listServers();
        const servers = res?.data || [];

        if (servers.length === 0) {
          info("No servers found.");
          return;
        }

        if (opts.stats) {
          // Fetch resources for each server
          const rows = [];
          for (const s of servers) {
            const attr = s.attributes;
            try {
              const r = await client.getServerResources(attr.identifier);
              const state = r?.attributes?.current_state || "unknown";
              const res = r?.attributes?.resources || {};
              rows.push([
                attr.identifier,
                attr.name.slice(0, 24),
                statusColor(state),
                bytesToHuman(res.memory_bytes || 0),
                `${(res.cpu_absolute || 0).toFixed(1)}%`,
                bytesToHuman(res.disk_bytes || 0)
              ]);
            } catch {
              rows.push([attr.identifier, attr.name.slice(0, 24), `${C.dim}unknown${C.reset}`, "-", "-", "-"]);
            }
          }
          table(["ID", "NAME", "STATUS", "RAM", "CPU", "DISK"], rows);
        } else {
          const rows = servers.map(s => [
            s.attributes.identifier,
            s.attributes.name,
            s.attributes.node || "-"
          ]);
          table(["ID", "NAME", "NODE"], rows);
        }

        console.log(`${C.dim}Total: ${servers.length} servers${C.reset}`);
      } catch (e) {
        err(e.message);
      }
    });

  // ── STATUS ────────────────────────────────────────────────
  server
    .command("status <id>")
    .description("Get server status and resources")
    .action(async (id) => {
      const cfg = requireConfig();
      const client = new PteroClient(cfg.panelUrl, cfg.clientKey);

      try {
        const res = await client.getServerResources(id);
        const attr = res?.attributes || {};
        const r = attr.resources || {};

        header(`Server: ${id}`);
        console.log(`  Status  : ${statusColor(attr.current_state || "unknown")}`);
        console.log(`  RAM     : ${C.cyan}${bytesToHuman(r.memory_bytes || 0)}${C.reset}`);
        console.log(`  CPU     : ${C.cyan}${(r.cpu_absolute || 0).toFixed(2)}%${C.reset}`);
        console.log(`  Disk    : ${C.cyan}${bytesToHuman(r.disk_bytes || 0)}${C.reset}`);
        console.log(`  Net RX  : ${C.dim}${bytesToHuman(r.network_rx_bytes || 0)}${C.reset}`);
        console.log(`  Net TX  : ${C.dim}${bytesToHuman(r.network_tx_bytes || 0)}${C.reset}`);
        console.log();
      } catch (e) {
        err(e.message);
      }
    });

  // ── START ─────────────────────────────────────────────────
  server
    .command("start <id>")
    .description("Start a server")
    .action(async (id) => {
      const cfg = requireConfig();
      const client = new PteroClient(cfg.panelUrl, cfg.clientKey);
      try {
        await client.startServer(id);
        ok(`Start signal sent to server: ${id}`);
      } catch (e) { err(e.message); }
    });

  // ── STOP ──────────────────────────────────────────────────
  server
    .command("stop <id>")
    .description("Stop a server")
    .action(async (id) => {
      const cfg = requireConfig();
      const client = new PteroClient(cfg.panelUrl, cfg.clientKey);
      try {
        await client.stopServer(id);
        ok(`Stop signal sent to server: ${id}`);
      } catch (e) { err(e.message); }
    });

  // ── RESTART ───────────────────────────────────────────────
  server
    .command("restart <id>")
    .description("Restart a server")
    .action(async (id) => {
      const cfg = requireConfig();
      const client = new PteroClient(cfg.panelUrl, cfg.clientKey);
      try {
        await client.restartServer(id);
        ok(`Restart signal sent to server: ${id}`);
      } catch (e) { err(e.message); }
    });

  // ── KILL ──────────────────────────────────────────────────
  server
    .command("kill <id>")
    .description("Force stop a server")
    .action(async (id) => {
      const cfg = requireConfig();
      const client = new PteroClient(cfg.panelUrl, cfg.clientKey);
      try {
        await client.killServer(id);
        ok(`Kill signal sent to server: ${id}`);
      } catch (e) { err(e.message); }
    });

  // ── COMMAND ───────────────────────────────────────────────
  server
    .command("cmd <id> <command>")
    .description("Send a console command to a server")
    .action(async (id, command) => {
      const cfg = requireConfig();
      const client = new PteroClient(cfg.panelUrl, cfg.clientKey);
      try {
        await client.sendCommand(id, command);
        ok(`Command sent to ${id}: ${command}`);
      } catch (e) { err(e.message); }
    });

  // ── SUSPEND / UNSUSPEND ───────────────────────────────────
  server
    .command("suspend <id>")
    .description("Suspend a server (admin)")
    .action(async (id) => {
      const cfg = requireConfig();
      const app = new PteroApp(cfg.panelUrl, cfg.appKey || cfg.clientKey);
      try {
        await app.suspendServer(id);
        ok(`Server ${id} suspended`);
      } catch (e) { err(e.message); }
    });

  server
    .command("unsuspend <id>")
    .description("Unsuspend a server (admin)")
    .action(async (id) => {
      const cfg = requireConfig();
      const app = new PteroApp(cfg.panelUrl, cfg.appKey || cfg.clientKey);
      try {
        await app.unsuspendServer(id);
        ok(`Server ${id} unsuspended`);
      } catch (e) { err(e.message); }
    });
};
        
