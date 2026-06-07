# @aetherix-ops/ptero-cli

<div align="center">

![npm](https://img.shields.io/npm/v/@aetherix-ops/ptero-cli?style=flat-square&color=00d2ff)
![license](https://img.shields.io/npm/l/@aetherix-ops/ptero-cli?style=flat-square&color=green)
![node](https://img.shields.io/node/v/@aetherix-ops/ptero-cli?style=flat-square&color=339933)

**Command line tool for managing Pterodactyl Panel from your terminal.**
Built on top of [@aetherix-ops/ptero-api](https://github.com/Aetherix-ops/ptero-api).

</div>

---

## Installation

    npm install -g @aetherix-ops/ptero-cli

---

## Setup

    ptero config setup

Or set environment variables:

    export PTERO_URL=https://panel.yourdomain.com
    export PTERO_CLIENT_KEY=your_client_api_key
    export PTERO_APP_KEY=your_application_api_key

Config is saved to `~/.ptero/config.json`

---

## Commands

### Server

```bash
# List all servers
ptero server list
ptero server ls

# List with RAM/CPU stats
ptero server list --stats

# Get server status and resources
ptero server status <id>

# Power actions
ptero server start <id>
ptero server stop <id>
ptero server restart <id>
ptero server kill <id>

# Send console command
ptero server cmd <id> "say Hello!"

# Suspend / unsuspend (admin)
ptero server suspend <id>
ptero server unsuspend <id>
```

### User (Admin)

```bash
# List all users
ptero user list

# Get user details
ptero user info <id>

# Create user
ptero user create \
  --email user@example.com \
  --username newuser \
  --firstname John \
  --lastname Doe

# Delete user
ptero user delete <id>
```

### Node (Admin)

```bash
# List all nodes
ptero node list

# Get node details
ptero node info <id>
```

---

## Output Example

```
──────────────────────────────────────────────────
 Servers
──────────────────────────────────────────────────

ID          NAME                      NODE
abc12345    Servermc                  node-1
def67890    Discord Bot               node-1
ghi11223    Dev API                   node-1

Total: 3 servers
```

```
──────────────────────────────────────────────────
 Servers (with --stats)
──────────────────────────────────────────────────

ID          NAME          STATUS       RAM        CPU     DISK
abc12345    SermcSMP      ● running    2.1GB      28.4%   8.2GB
def67890    Discord Bot   ● running    512.0MB    12.1%   1.1GB
ghi11223    Dev API       ○ offline    -          -       -
```

---

## Related

- [ptero-api](https://github.com/Aetherix-ops/ptero-api) — The API library powering this CLI
- [ptero-scripts](https://github.com/Aetherix-ops/ptero-scripts) — Shell scripts for Pterodactyl
- [ptero-eggs](https://github.com/Aetherix-ops/ptero-eggs) — Updated egg collection

---

## License

MIT — by [aetherix-ops](https://github.com/Aetherix-ops)
