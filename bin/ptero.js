#!/usr/bin/env node
// =============================================================
//  @aetherix-ops/ptero-cli
//  Command line tool for Pterodactyl Panel
//
//  Usage:
//    ptero --help
//    ptero server list
//    ptero server restart <id>
// =============================================================

"use strict";

const { program } = require("commander");
const { loadConfig } = require("./src/config");
const serverCmd = require("./src/commands/server");
const userCmd = require("./src/commands/user");
const nodeCmd = require("./src/commands/node");

const pkg = require("./package.json");

// Load config before anything
loadConfig();

program
  .name("ptero")
  .description("CLI tool for Pterodactyl Panel")
  .version(pkg.version);

// Register commands
serverCmd(program);
userCmd(program);
nodeCmd(program);

program.parse(process.argv);

// Show help if no command given
if (!process.argv.slice(2).length) {
  program.outputHelp();
  }
