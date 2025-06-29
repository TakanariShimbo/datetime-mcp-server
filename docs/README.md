[English](README.md) | [日本語](README_ja.md) | **README**

# DateTime MCP Server

A Model Context Protocol (MCP) server that provides tools to get the current date and time in various formats. This is a TypeScript implementation of the datetime MCP server, demonstrating how to build MCP servers using the TypeScript SDK.

## Features

- Get current date and time in multiple formats (ISO, Unix timestamp, human-readable, etc.)
- Configurable output format via environment variables
- Timezone support
- Custom date format support
- Simple tool: `get_current_time`

## Usage

Choose one of these examples based on your needs:

**Basic usage (ISO format):**

```json
{
  "mcpServers": {
    "datetime": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/datetime-mcp-server"]
    }
  }
}
```

**Human-readable format with timezone:**

```json
{
  "mcpServers": {
    "datetime": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/datetime-mcp-server"],
      "env": {
        "DATETIME_FORMAT": "human",
        "TIMEZONE": "America/New_York"
      }
    }
  }
}
```

**Unix timestamp format:**

```json
{
  "mcpServers": {
    "datetime": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/datetime-mcp-server"],
      "env": {
        "DATETIME_FORMAT": "unix",
        "TIMEZONE": "UTC"
      }
    }
  }
}
```

**Custom format:**

```json
{
  "mcpServers": {
    "datetime": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/datetime-mcp-server"],
      "env": {
        "DATETIME_FORMAT": "custom",
        "DATE_FORMAT_STRING": "YYYY/MM/DD HH:mm",
        "TIMEZONE": "Asia/Tokyo"
      }
    }
  }
}
```

## Configuration

The server can be configured using environment variables:

### `DATETIME_FORMAT`

Controls the default output format of the datetime (default: "iso")

Supported formats:

- `iso`: ISO 8601 format (2024-01-01T12:00:00.000Z)
- `unix`: Unix timestamp in seconds
- `unix_ms`: Unix timestamp in milliseconds
- `human`: Human-readable format (Mon, Jan 1, 2024 12:00:00 PM)
- `date`: Date only (2024-01-01)
- `time`: Time only (12:00:00)
- `custom`: Custom format using DATE_FORMAT_STRING environment variable

### `DATE_FORMAT_STRING`

Custom date format string (only used when DATETIME_FORMAT="custom")
Default: "YYYY-MM-DD HH:mm:ss"

Supported tokens:

- `YYYY`: 4-digit year
- `YY`: 2-digit year
- `MM`: 2-digit month
- `DD`: 2-digit day
- `HH`: 2-digit hour (24-hour)
- `mm`: 2-digit minute
- `ss`: 2-digit second

### `TIMEZONE`

Timezone to use (default: system timezone)
Examples: "UTC", "America/New_York", "Asia/Tokyo"

## Available Tools

### `get_current_time`

Get the current date and time

Parameters:

- `format` (optional): Output format, overrides DATETIME_FORMAT env var
- `timezone` (optional): Timezone to use, overrides TIMEZONE env var

## Development

1. **Clone this repository**

   ```bash
   git clone https://github.com/TakanariShimbo/npx-datetime-mcp-server.git
   cd npx-datetime-mcp-server
   ```

2. **Install dependencies**

   ```bash
   npm ci
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Test with MCP Inspector (optional)**

   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

## Publishing to NPM

This project includes automated NPM publishing via GitHub Actions. To set up publishing:

### 1. Create NPM Access Token

1. **Log in to NPM** (create account if needed)

   ```bash
   npm login
   ```

2. **Create Access Token**
   - Go to https://www.npmjs.com/settings/tokens
   - Click "Generate New Token"
   - Select "Automation" (for CI/CD usage)
   - Choose "Publish" permission level
   - Copy the generated token (starts with `npm_`)

### 2. Add Token to GitHub Repository

1. **Navigate to Repository Settings**

   - Go to your GitHub repository
   - Click "Settings" tab
   - Go to "Secrets and variables" → "Actions"

2. **Add NPM Token**
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your NPM token from step 1
   - Click "Add secret"

### 3. Setup GitHub Personal Access Token (for release script)

The release script needs to push to GitHub, so you'll need a GitHub token:

1. **Create GitHub Personal Access Token**

   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Set expiration (recommended: 90 days or custom)
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
   - Click "Generate token"
   - Copy the generated token (starts with `ghp_`)

2. **Configure Git with Token**

   ```bash
   # Option 1: Use GitHub CLI (recommended)
   gh auth login

   # Option 2: Configure git to use token
   git config --global credential.helper store
   # Then when prompted for password, use your token instead
   ```

### 4. Release New Version

Use the included release script to automatically version, tag, and trigger publishing:

```bash
# Increment patch version (0.1.0 → 0.1.1)
npm run release patch

# Increment minor version (0.1.0 → 0.2.0)
npm run release minor

# Increment major version (0.1.0 → 1.0.0)
npm run release major

# Set specific version
npm run release 1.2.3
```

### 5. Verify Publication

1. **Check GitHub Actions**

   - Go to "Actions" tab in your repository
   - Verify the "Publish to npm" workflow completed successfully

2. **Verify NPM Package**
   - Visit: https://www.npmjs.com/package/@takanarishimbo/datetime-mcp-server
   - Or run: `npm view @takanarishimbo/datetime-mcp-server`

### Release Process Flow

1. `release.sh` script updates version in all files
2. Creates git commit and tag
3. Pushes to GitHub
4. GitHub Actions workflow triggers on new tag
5. Workflow builds project and publishes to NPM
6. Package becomes available globally via `npm install`

## Creating Desktop Extension (DXT)

Desktop Extensions (.dxt) enable one-click installation of MCP servers in Claude Desktop. To create a DXT file for this server:

### 1. Initialize DXT Manifest

Run this command in the project root directory:

```bash
npx @anthropic-ai/dxt init
```

This will guide you through creating a `manifest.json` file. Here are the answers for this project:

```
✔ Extension name: @takanarishimbo/datetime-mcp-server
✔ Author name: TakanariShimbo
✔ Display name (optional): datetime
✔ Version: 0.3.0
✔ Description: A Model Context Protocol server that returns the current date and time
✔ Add a detailed long description? no
✔ Author email (optional): 
✔ Author URL (optional): 
✔ Homepage URL (optional): https://github.com/TakanariShimbo/npx-datetime-mcp-server
✔ Documentation URL (optional): https://github.com/TakanariShimbo/npx-datetime-mcp-server
✔ Support URL (optional): https://github.com/TakanariShimbo/npx-datetime-mcp-server
✔ Icon file path (optional, relative to manifest): icon.png
✔ Add screenshots? no
✔ Server type: Node.js
✔ Entry point: dist/index.js
✔ Does your MCP Server provide tools you want to advertise (optional)? yes
✔ Tool name: get_current_time
✔ Tool description (optional): Get the current date and time in various formats
✔ Add another tool? no
✔ Does your server generate additional tools at runtime? no
✔ Does your MCP Server provide prompts you want to advertise (optional)? no
✔ Add compatibility constraints? no
✔ Add user-configurable options? no
✔ Keywords (comma-separated, optional): datetime
✔ License: MIT
✔ Add repository information? yes
✔ Repository URL: git+https://github.com/TakanariShimbo/npx-datetime-mcp-server.git
```

### 2. Create DXT Package

```bash
npx @anthropic-ai/dxt pack
```

This creates a `.dxt` file that users can install in Claude Desktop with a single click.

## Project Structure

```
npx-datetime-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── package.json          # Package configuration
├── package-lock.json     # Dependency lock file
├── tsconfig.json         # TypeScript configuration
├── scripts/
│   └── release.sh        # Release automation script
├── .github/
│   └── workflows/
│       └── npm-publish.yml   # NPM publish workflow
├── manifest.json         # MCP server manifest for DXT file
├── icon.png              # icon for DXT file
├── datetime.dxt          # DXT file
├── .gitignore            # Git ignore file
├── docs/
    ├── README.md         # English documentation
    └── README_ja.md      # Japanese documentation
```

## License

MIT
