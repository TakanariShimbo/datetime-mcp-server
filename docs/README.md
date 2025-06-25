[English](README.md) | [日本語](README_ja.md) | **README**

# DateTime MCP Server

A Model Context Protocol (MCP) server that provides tools to get the current date and time in various formats. This server demonstrates the basic structure of an MCP server and can be used as a reference for creating your own MCP servers.

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

### Method 1: Using Node.js locally

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

### Method 2: Using Docker (No Local Node.js Required)

If you don't have Node.js or npm installed locally, you can use Docker to build the project:

1. **Clone the repository**

   ```bash
   git clone https://github.com/TakanariShimbo/npx-datetime-mcp-server.git
   cd npx-datetime-mcp-server
   ```

2. **Build and extract with one command**

   ```bash
   # Build the project inside Docker and output directly to local directory
   docker build -t datetime-mcp-build .
   docker run --rm -v $(pwd):/app datetime-mcp-build
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

## Project Structure

```
npx-datetime-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Docker configuration
├── .gitignore            # Git ignore file
├── .github/
│   └── workflows/
│       └── npm-publish.yml   # NPM publish workflow
├── scripts/
│   └── release.sh        # Release automation script
├── docs/
│   ├── README.md         # This file
│   └── README_ja.md      # Japanese documentation
└── dist/                 # Compiled JavaScript (after build)
```

## License

MIT
