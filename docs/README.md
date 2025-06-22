# DateTime MCP Server

A Model Context Protocol (MCP) server that provides tools to get the current date and time in various formats. This server demonstrates the basic structure of an MCP server and can be used as a reference for creating your own MCP servers.

## Features

- Get current date and time in multiple formats (ISO, Unix timestamp, human-readable, etc.)
- Configurable output format via environment variables
- Timezone support
- Custom date format support
- Two tools: `get_current_time` and `get_timestamp`

## Quick Start

1. **Clone this repository**

   ```bash
   git clone https://github.com/TakanariShimbo/datetime-mcp-server.git
   cd datetime-mcp-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Test locally**
   ```bash
   npm start
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

## Usage Examples

### Basic usage

```bash
node dist/index.js
```

### With custom format

```bash
DATETIME_FORMAT=human node dist/index.js
```

### With timezone

```bash
DATETIME_FORMAT=iso TIMEZONE=America/New_York node dist/index.js
```

### With custom format string

```bash
DATETIME_FORMAT=custom DATE_FORMAT_STRING="YYYY/MM/DD HH:mm" node dist/index.js
```

## Integration with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "datetime": {
      "command": "node",
      "args": ["/path/to/your/server/dist/index.js"],
      "env": {
        "DATETIME_FORMAT": "human",
        "TIMEZONE": "America/New_York"
      }
    }
  }
}
```

## Available Tools

### `get_current_time`

Get the current date and time

Parameters:

- `format` (optional): Output format, overrides DATETIME_FORMAT env var
- `timezone` (optional): Timezone to use, overrides TIMEZONE env var

### `get_timestamp`

Get the current Unix timestamp

Parameters:

- `unit` (optional): "seconds" or "milliseconds" (default: "seconds")

## Development

### Run in development mode

```bash
npm run dev
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Creating Your Own MCP Server

To create your own MCP server based on this example:

1. Update `package.json`:

   - Change the `name` field (use @username/package-name format)
   - Update `description`, `author`, and other metadata
   - Add repository, bugs, and homepage URLs

2. Modify `index.ts`:

   - Change the server name and version
   - Add your own tools
   - Implement your custom logic

3. Update configuration files:
   - `Dockerfile`: Adjust if needed for your dependencies
   - GitHub workflows: Update if you need different CI/CD

4. Update documentation:
   - Replace this README with your server's documentation
   - Update LICENSE with your information

5. Set up publishing:
   - Create an npm account and generate an access token
   - Add NPM_TOKEN to your GitHub repository secrets
   - Use `npm run release` to publish new versions

## Project Structure

```
datetime-mcp-server/
├── index.ts              # Main server implementation
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Docker configuration
├── LICENSE               # MIT license
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
