#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * DateTime MCP Server
 *
 * This server provides tools to get the current date and time in various formats.
 *
 * Environment Variables:
 * - DATETIME_FORMAT: Controls the output format of the datetime (default: "iso")
 *   Supported formats:
 *   - "iso": ISO 8601 format (2024-01-01T12:00:00.000Z)
 *   - "unix": Unix timestamp in seconds
 *   - "unix_ms": Unix timestamp in milliseconds
 *   - "human": Human-readable format (Mon, Jan 1, 2024 12:00:00 PM)
 *   - "date": Date only (2024-01-01)
 *   - "time": Time only (12:00:00)
 *   - "custom": Custom format using DATE_FORMAT_STRING environment variable
 * - DATE_FORMAT_STRING: Custom date format string (only used when DATETIME_FORMAT="custom")
 *   Uses standard date formatting tokens
 * - TIMEZONE: Timezone to use (default: system timezone)
 *   Examples: "UTC", "America/New_York", "Asia/Tokyo"
 *
 * Example:
 *   DATETIME_FORMAT=iso node dist/index.js
 *   DATETIME_FORMAT=human TIMEZONE=America/New_York node dist/index.js
 *   DATETIME_FORMAT=custom DATE_FORMAT_STRING="YYYY-MM-DD HH:mm:ss" node dist/index.js
 */

// Get configuration from environment variables
const DATETIME_FORMAT = process.env.DATETIME_FORMAT || "iso";
const DATE_FORMAT_STRING =
  process.env.DATE_FORMAT_STRING || "YYYY-MM-DD HH:mm:ss";
const TIMEZONE =
  process.env.TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;

// Define tools
const GET_CURRENT_TIME_TOOL: Tool = {
  name: "get_current_time",
  description: "Get the current date and time",
  inputSchema: {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: ["iso", "unix", "unix_ms", "human", "date", "time", "custom"],
        description: `Output format for the datetime (optional, defaults to "${DATETIME_FORMAT}" from env)`,
      },
      timezone: {
        type: "string",
        description: `Timezone to use (optional, defaults to "${TIMEZONE}" from env)`,
      },
    },
  },
};

const GET_TIMESTAMP_TOOL: Tool = {
  name: "get_timestamp",
  description: "Get the current Unix timestamp",
  inputSchema: {
    type: "object",
    properties: {
      unit: {
        type: "string",
        enum: ["seconds", "milliseconds"],
        description: "Unit for the timestamp (optional, defaults to 'seconds')",
      },
    },
  },
};

// Server implementation
const server = new Server(
  {
    name: "datetime-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to format date based on format type
function formatDateTime(date: Date, format: string, timezone: string): string {
  // Create date in the specified timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
  };

  switch (format) {
    case "iso":
      return date.toISOString();

    case "unix":
      return Math.floor(date.getTime() / 1000).toString();

    case "unix_ms":
      return date.getTime().toString();

    case "human":
      options.weekday = "short";
      options.year = "numeric";
      options.month = "short";
      options.day = "numeric";
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.second = "2-digit";
      options.hour12 = true;
      return date.toLocaleString("en-US", options);

    case "date":
      options.year = "numeric";
      options.month = "2-digit";
      options.day = "2-digit";
      return date.toLocaleDateString("en-CA", options); // en-CA gives YYYY-MM-DD format

    case "time":
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.second = "2-digit";
      options.hour12 = false;
      return date.toLocaleTimeString("en-US", options);

    case "custom":
      // Simple custom format implementation
      return formatCustomDate(date, DATE_FORMAT_STRING, timezone);

    default:
      return date.toISOString();
  }
}

// Simple custom date formatter
function formatCustomDate(
  date: Date,
  formatString: string,
  timezone: string
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
  const partsMap: Record<string, string> = {};

  parts.forEach((part) => {
    partsMap[part.type] = part.value;
  });

  return formatString
    .replace(/YYYY/g, partsMap.year || "")
    .replace(/YY/g, (partsMap.year || "").slice(-2))
    .replace(/MM/g, partsMap.month || "")
    .replace(/DD/g, partsMap.day || "")
    .replace(/HH/g, partsMap.hour || "")
    .replace(/mm/g, partsMap.minute || "")
    .replace(/ss/g, partsMap.second || "");
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [GET_CURRENT_TIME_TOOL, GET_TIMESTAMP_TOOL],
}));

// Set up the request handler for tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_current_time") {
    const format = (args as any)?.format || DATETIME_FORMAT;
    const timezone = (args as any)?.timezone || TIMEZONE;
    const now = new Date();

    try {
      const formattedDate = formatDateTime(now, format, timezone);
      return {
        content: [
          {
            type: "text",
            text: formattedDate,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error formatting date: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  if (name === "get_timestamp") {
    const unit = (args as any)?.unit || "seconds";
    const now = new Date();
    const timestamp =
      unit === "milliseconds"
        ? now.getTime()
        : Math.floor(now.getTime() / 1000);

    return {
      content: [
        {
          type: "text",
          text: timestamp.toString(),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${name}`,
      },
    ],
    isError: true,
  };
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`DateTime MCP Server running on stdio`);
  console.error(`Default format: ${DATETIME_FORMAT}`);
  console.error(`Default timezone: ${TIMEZONE}`);
  if (DATETIME_FORMAT === "custom") {
    console.error(`Custom format string: ${DATE_FORMAT_STRING}`);
  }
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
