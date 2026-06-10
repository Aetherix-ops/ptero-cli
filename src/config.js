"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

// Colors (defined first to avoid ReferenceError)
const C = {
  red:   "\x1b[31m",
  cyan:  "\x1b[36m",
  dim:   "\x1b[2m",
  reset: "\x1b[0m"
};

const CONFIG_PATH = path.join(os.homedir(), ".ptero", "config.json");

let config = {
  panelUrl: process.env.PTERO_URL || "",
  clientKey: process.env.PTERO_CLIENT_KEY || "",
  appKey: process.env.PTERO_APP_KEY || ""
};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      config = { ...config, ...data };
    }
  } catch {
    // Config file not found or invalid, use env vars
  }
}

function saveConfig(data) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const merged = { ...config, ...data };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
  config = merged;
}

function getConfig() {
  return config;
}

function requireConfig() {
  if (!config.panelUrl || !config.clientKey) {
    console.error(`
${C.red}[ERR] Not configured.${C.reset}

Run: ${C.cyan}ptero config setup${C.reset}

Or set environment variables:
  ${C.dim}PTERO_URL=https://panel.yourdomain.com${C.reset}
  ${C.dim}PTERO_CLIENT_KEY=your_client_key${C.reset}
`);
    process.exit(1);
  }
  return config;
}

module.exports = { loadConfig, saveConfig, getConfig, requireConfig, CONFIG_PATH, C };
