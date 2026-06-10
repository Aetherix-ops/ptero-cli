"use strict";

const { PteroApp } = require("@aetherix-ops/ptero-api");
const { requireConfig } = require("../config");
const { ok, err, info, header, table, C } = require("../output");

module.exports = function(program) {
  const user = program
    .command("user")
    .description("Manage Pterodactyl users (admin)");

  // Helper to get PteroApp instance with validation
  function getAppClient(cfg) {
    if (!cfg.appKey) {
      err("This command requires an Application API Key (PTERO_APP_KEY).");
      process.exit(1);
    }
    return new PteroApp(cfg.panelUrl, cfg.appKey);
  }

  // ── LIST ───────────────────────────────────
  user
    .command("list")
    .alias("ls")
    .description("List all users")
    .action(async () => {
      const cfg = requireConfig();
      const app = getAppClient(cfg);

      try {
        header("Users");
        const res = await app.listUsers();
        const users = res?.data || [];

        if (users.length === 0) {
          info("No users found.");
          return;
        }

        const rows = users.map(u => [
          u.attributes.id,
          u.attributes.username,
          u.attributes.email,
          u.attributes.root_admin ? `${C.yellow}admin${C.reset}` : "user",
          u.attributes.created_at?.slice(0, 10) || "-"
        ]);

        table(["ID", "USERNAME", "EMAIL", "ROLE", "CREATED"], rows);
        console.log(`${C.dim}Total: ${users.length} users${C.reset}`);
      } catch (e) {
        err(e.message);
      }
    });

  // ── INFO ───────────────────────────────────
  user
    .command("info <id>")
    .description("Get user details")
    .action(async (id) => {
      const cfg = requireConfig();
      const app = getAppClient(cfg);

      try {
        const res = await app.getUser(id);
        const u = res?.attributes || {};

        header(`User: ${u.username}`);
        console.log(`  ID       : ${u.id}`);
        console.log(`  Username : ${C.white}${u.username}${C.reset}`);
        console.log(`  Email    : ${u.email}`);
        console.log(`  Name     : ${u.first_name} ${u.last_name}`);
        console.log(`  Role     : ${u.root_admin ? `${C.yellow}admin${C.reset}` : "user"}`);
        console.log(`  Created  : ${u.created_at?.slice(0, 10) || "-"}`);
        console.log();
      } catch (e) {
        err(e.message);
      }
    });

  // ── CREATE ───────────────────────────────────
  user
    .command("create")
    .description("Create a new user")
    .requiredOption("--email <email>", "User email")
    .requiredOption("--username <username>", "Username")
    .requiredOption("--firstname <name>", "First name")
    .requiredOption("--lastname <name>", "Last name")
    .option("--password <password>", "Password")
    .action(async (opts) => {
      const cfg = requireConfig();
      const app = getAppClient(cfg);

      try {
        const res = await app.createUser({
          email: opts.email,
          username: opts.username,
          first_name: opts.firstname,
          last_name: opts.lastname,
          password: opts.password || undefined
        });
        ok(`User created: ${res?.attributes?.username} (ID: ${res?.attributes?.id})`);
      } catch (e) {
        err(e.message);
      }
    });

  // ── DELETE ───────────────────────────────────
  user
    .command("delete <id>")
    .description("Delete a user")
    .action(async (id) => {
      const cfg = requireConfig();
      const app = getAppClient(cfg);

      try {
        await app.deleteUser(id);
        ok(`User ${id} deleted`);
      } catch (e) {
        err(e.message);
      }
    });
};
