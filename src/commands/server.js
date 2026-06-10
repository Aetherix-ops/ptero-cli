"use strict";

const { PteroClient, PteroApp } = require("@aetherix-ops/ptero-api");
const { requireConfig } = require("../config");
const { ok, err, info, warn, header, table, statusColor, bytesToHuman, C } = require("../output");

module.exports = function(program) {
  const server = program
    .command("server")
    .description("Manage Pterodactyl servers");

  // ── LIST ───────────────────────────────────
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
          // Fetch resources in parallel for better performance
          const promises = servers.map(async (s) => {
            const attr = s.attributes;
            try {
              const r = await client.getServerResources(attr.identifier);
              const state = r?.attributes?.current_state || "unknown";
              const res = r?.attributes?.resources || {};
              return [
                attr.identifier,
                attr.name.slice(0, 24),
                statusColor(state),
                bytesToHuman(res.memory_bytes || 0),
                `${(res.cpu_absolute || 0).toFixed(1)}%`,
                bytesToHuman(res.disk_bytes || 0)
              ];
            } catch {
              return [attr.identifier, attr.name.slice(0, 24), `${C.dim}unknown${C.reset}`, "-", "-", "-"];
            }
          });

          const rows = await Promise.all(promises);
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

  // ── STATUS ───────────────────────────────────
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

  // ── POWER ACTIONS ──────────────────────────────────
  const createPowerAction = (action, description) => {
    server
      .command(`${action} <id>`)
      .description(description)
      .action(async (id) => {
        const cfg = requireConfig();
        const client = new PteroClient(cfg.panelUrl, cfg.clientKey);
        try {
          if (action === "start") await client.startServer(id);
          else if (action === "stop") await client.stopServer(id);
          else if (action === "restart") await client.restartServer(id);
          else if (action === "kill") await client.killServer(id);

          ok(`${action.charAt(0).toUpperCase() + action.slice(1)} signal sent to server: ${id}`);
        } catch (e) { err(e.message); }
      });
  };

  createPowerAction("start", "Start a server");
  createPowerAction("stop", "Stop a server");
  createPowerAction("restart", "Restart a server");
  createPowerAction("kill", "Force stop a server");

  // ── SEND COMMAND ──────────────────────────────────
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

  // ── ADMIN ACTIONS (Suspend / Unsuspend) ────────────────────────────
  const createAdminAction = (action, description) => {
    server
      .command(`${action} <id>`)
      .description(description)
      .action(async (id) => {
        const cfg = requireConfig();

        if (!cfg.appKey) {
          err("This command requires an Application API Key (PTERO_APP_KEY).");
          return;
        }

        const app = new PteroApp(cfg.panelUrl, cfg.appKey);
        try {
          if (action === "suspend") await app.suspendServer(id);
          else if (action === "unsuspend") await app.unsuspendServer(id);

          ok(`Server ${id} ${action}ed`);
        } catch (e) { err(e.message); }
      });
  };

  createAdminAction("suspend", "Suspend a server (requires App Key)");
  createAdminAction("unsuspend", "Unsuspend a server (requires App Key)");
};
