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

## Project Structure

```
datetime-mcp-server/
├── index.ts              # Main server implementation
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

## Development

### Method 1: Using Node.js locally

1. **Clone this repository**

   ```bash
   git clone https://github.com/TakanariShimbo/datetime-mcp-server.git
   cd datetime-mcp-server
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
   git clone https://github.com/TakanariShimbo/datetime-mcp-server.git
   cd datetime-mcp-server
   ```

2. **Build and extract with one command**

   ```bash
   # Build the project inside Docker and output directly to local directory
   docker build -t datetime-mcp-build .
   docker run --rm -v $(pwd):/app datetime-mcp-build
   ```

## License

MIT
