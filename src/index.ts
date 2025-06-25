#!/usr/bin/env node
/**
 * 0. DateTime MCP Server
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
 *
 * 0. 日時MCPサーバー
 *
 * このサーバーは、現在の日付と時刻を様々な形式で取得するツールを提供します。
 *
 * 環境変数:
 * - DATETIME_FORMAT: 日時の出力形式を制御します（デフォルト: "iso"）
 *   サポートされる形式:
 *   - "iso": ISO 8601形式 (2024-01-01T12:00:00.000Z)
 *   - "unix": 秒単位のUnixタイムスタンプ
 *   - "unix_ms": ミリ秒単位のUnixタイムスタンプ
 *   - "human": 人間が読める形式 (Mon, Jan 1, 2024 12:00:00 PM)
 *   - "date": 日付のみ (2024-01-01)
 *   - "time": 時刻のみ (12:00:00)
 *   - "custom": DATE_FORMAT_STRING環境変数を使用したカスタム形式
 * - DATE_FORMAT_STRING: カスタム日付形式文字列（DATETIME_FORMAT="custom"の場合のみ使用）
 *   標準的な日付フォーマットトークンを使用
 * - TIMEZONE: 使用するタイムゾーン（デフォルト: システムタイムゾーン）
 *   例: "UTC", "America/New_York", "Asia/Tokyo"
 *
 * 例:
 *   DATETIME_FORMAT=iso node dist/index.js
 *   DATETIME_FORMAT=human TIMEZONE=America/New_York node dist/index.js
 *   DATETIME_FORMAT=custom DATE_FORMAT_STRING="YYYY-MM-DD HH:mm:ss" node dist/index.js
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * 1. Environment Configuration
 *
 * Get configuration from environment variables
 *
 * Examples:
 *   DATETIME_FORMAT="iso" → ISO 8601 format output
 *   DATETIME_FORMAT="unix" → Unix timestamp in seconds
 *   DATETIME_FORMAT="custom" DATE_FORMAT_STRING="YYYY-MM-DD" → Custom date format
 *   TIMEZONE="America/New_York" → Use New York timezone
 *   No environment variables → Defaults to ISO format with system timezone
 *
 * 1. 環境設定
 *
 * 環境変数から設定を取得
 *
 * 例:
 *   DATETIME_FORMAT="iso" → ISO 8601形式の出力
 *   DATETIME_FORMAT="unix" → 秒単位のUnixタイムスタンプ
 *   DATETIME_FORMAT="custom" DATE_FORMAT_STRING="YYYY-MM-DD" → カスタム日付形式
 *   TIMEZONE="America/New_York" → ニューヨークのタイムゾーンを使用
 *   環境変数なし → システムタイムゾーンでISO形式をデフォルト使用
 */
const DATETIME_FORMAT = process.env.DATETIME_FORMAT || "iso";
const DATE_FORMAT_STRING =
  process.env.DATE_FORMAT_STRING || "YYYY-MM-DD HH:mm:ss";
const TIMEZONE =
  process.env.TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * 2. Tool Definition
 *
 * Define the get_current_time tool with its schema
 *
 * Examples:
 *   Tool name: "get_current_time"
 *   Input: { format: "iso" } → Returns ISO format datetime
 *   Input: { format: "unix", timezone: "UTC" } → Returns Unix timestamp in UTC
 *   Input: {} → Uses environment defaults
 *   Valid formats: iso, unix, unix_ms, human, date, time, custom
 *   Valid timezones: Any IANA timezone (e.g., "UTC", "America/New_York", "Asia/Tokyo")
 *
 * 2. ツール定義
 *
 * get_current_timeツールとそのスキーマを定義
 *
 * 例:
 *   ツール名: "get_current_time"
 *   入力: { format: "iso" } → ISO形式の日時を返す
 *   入力: { format: "unix", timezone: "UTC" } → UTC でUnixタイムスタンプを返す
 *   入力: {} → 環境デフォルトを使用
 *   有効な形式: iso, unix, unix_ms, human, date, time, custom
 *   有効なタイムゾーン: 任意のIANAタイムゾーン (例: "UTC", "America/New_York", "Asia/Tokyo")
 */
const GET_CURRENT_TIME_TOOL: Tool = {
  name: "get_current_time",
  description: "Get the current date and time in various formats",
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

/**
 * 3. Server Initialization
 *
 * Create MCP server instance with metadata and capabilities
 *
 * Examples:
 *   Server name: "datetime-mcp-server"
 *   Version: "0.1.0"
 *   Capabilities: tools (provides tool functionality)
 *   Transport: StdioServerTransport (communicates via stdin/stdout)
 *   Protocol: Model Context Protocol (MCP)
 *
 * 3. サーバー初期化
 *
 * メタデータと機能を持つMCPサーバーインスタンスを作成
 *
 * 例:
 *   サーバー名: "datetime-mcp-server"
 *   バージョン: "0.1.0"
 *   機能: tools (ツール機能を提供)
 *   トランスポート: StdioServerTransport (stdin/stdout経由で通信)
 *   プロトコル: Model Context Protocol (MCP)
 */
const server = new Server(
  {
    name: "datetime-mcp-server",
    version: "0.2.6",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 4. Date Formatting Function
 *
 * Helper function to format date based on format type
 *
 * Examples:
 *   formatDateTime(date, "iso", "UTC") → "2024-01-15T10:30:00.000Z"
 *   formatDateTime(date, "unix", "UTC") → "1705318200"
 *   formatDateTime(date, "human", "America/New_York") → "Mon, Jan 15, 2024 05:30:00 AM"
 *   formatDateTime(date, "date", "Asia/Tokyo") → "2024-01-15"
 *   formatDateTime(date, "time", "Europe/London") → "10:30:00"
 *   formatDateTime(date, "custom", "UTC") → Uses DATE_FORMAT_STRING environment variable
 *
 * 4. 日付フォーマット関数
 *
 * 形式タイプに基づいて日付をフォーマットするヘルパー関数
 *
 * 例:
 *   formatDateTime(date, "iso", "UTC") → "2024-01-15T10:30:00.000Z"
 *   formatDateTime(date, "unix", "UTC") → "1705318200"
 *   formatDateTime(date, "human", "America/New_York") → "Mon, Jan 15, 2024 05:30:00 AM"
 *   formatDateTime(date, "date", "Asia/Tokyo") → "2024-01-15"
 *   formatDateTime(date, "time", "Europe/London") → "10:30:00"
 *   formatDateTime(date, "custom", "UTC") → DATE_FORMAT_STRING環境変数を使用
 */
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

/**
 * 5. Custom Date Formatter
 *
 * Simple custom date formatter with token replacement
 *
 * Examples:
 *   formatCustomDate(date, "YYYY-MM-DD", "UTC") → "2024-01-15"
 *   formatCustomDate(date, "DD/MM/YYYY HH:mm", "UTC") → "15/01/2024 10:30"
 *   formatCustomDate(date, "YY-MM-DD HH:mm:ss", "UTC") → "24-01-15 10:30:45"
 *   Supported tokens: YYYY (4-digit year), YY (2-digit year), MM (month), DD (day)
 *                     HH (24-hour), mm (minutes), ss (seconds)
 *
 * 5. カスタム日付フォーマッター
 *
 * トークン置換を使用したシンプルなカスタム日付フォーマッター
 *
 * 例:
 *   formatCustomDate(date, "YYYY-MM-DD", "UTC") → "2024-01-15"
 *   formatCustomDate(date, "DD/MM/YYYY HH:mm", "UTC") → "15/01/2024 10:30"
 *   formatCustomDate(date, "YY-MM-DD HH:mm:ss", "UTC") → "24-01-15 10:30:45"
 *   サポートされるトークン: YYYY (4桁の年), YY (2桁の年), MM (月), DD (日)
 *                         HH (24時間), mm (分), ss (秒)
 */
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

/**
 * 6. Tool List Handler
 *
 * Handle requests to list available tools
 *
 * Examples:
 *   Request: ListToolsRequest → Response: { tools: [GET_CURRENT_TIME_TOOL] }
 *   Available tools: get_current_time
 *   Tool count: 1
 *   This handler responds to MCP clients asking what tools are available
 *
 * 6. ツールリストハンドラー
 *
 * 利用可能なツールをリストするリクエストを処理
 *
 * 例:
 *   リクエスト: ListToolsRequest → レスポンス: { tools: [GET_CURRENT_TIME_TOOL] }
 *   利用可能なツール: get_current_time
 *   ツール数: 1
 *   このハンドラーは利用可能なツールを尋ねるMCPクライアントに応答
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [GET_CURRENT_TIME_TOOL],
}));

/**
 * 7. Tool Call Handler
 *
 * Set up the request handler for tool calls
 *
 * Examples:
 *   Request: { name: "get_current_time", arguments: {} } → Uses environment defaults
 *   Request: { name: "get_current_time", arguments: { format: "unix" } } → Unix timestamp
 *   Request: { name: "get_current_time", arguments: { timezone: "UTC" } } → UTC time
 *   Request: { name: "unknown_tool" } → Error: "Unknown tool: unknown_tool"
 *   Invalid timezone → Error: "Error formatting date: Invalid time zone specified"
 *
 * 7. ツール呼び出しハンドラー
 *
 * ツール呼び出しのリクエストハンドラーを設定
 *
 * 例:
 *   リクエスト: { name: "get_current_time", arguments: {} } → 環境デフォルトを使用
 *   リクエスト: { name: "get_current_time", arguments: { format: "unix" } } → Unixタイムスタンプ
 *   リクエスト: { name: "get_current_time", arguments: { timezone: "UTC" } } → UTC時刻
 *   リクエスト: { name: "unknown_tool" } → エラー: "Unknown tool: unknown_tool"
 *   無効なタイムゾーン → エラー: "Error formatting date: Invalid time zone specified"
 */
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

/**
 * 8. Server Startup Function
 *
 * Initialize and run the MCP server with stdio transport
 *
 * Examples:
 *   Normal startup → "DateTime MCP Server running on stdio"
 *   With ISO format → "Default format: iso"
 *   With custom format → "Default format: custom" + "Custom format string: YYYY-MM-DD"
 *   With timezone → "Default timezone: America/New_York"
 *   Connection error → Process exits with code 1
 *
 * 8. サーバー起動関数
 *
 * stdioトランスポートでMCPサーバーを初期化して実行
 *
 * 例:
 *   通常の起動 → "DateTime MCP Server running on stdio"
 *   ISO形式で → "Default format: iso"
 *   カスタム形式で → "Default format: custom" + "Custom format string: YYYY-MM-DD"
 *   タイムゾーン付き → "Default timezone: America/New_York"
 *   接続エラー → プロセスはコード1で終了
 */
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

/**
 * 9. Server Execution
 *
 * Execute the server and handle fatal errors
 *
 * Examples:
 *   Successful start → Server runs indefinitely, handling MCP requests
 *   Port already in use → "Fatal error running server: EADDRINUSE"
 *   Missing dependencies → "Fatal error running server: Cannot find module"
 *   Permission denied → "Fatal error running server: EACCES"
 *   Any fatal error → Logs error and exits with code 1
 *
 * 9. サーバー実行
 *
 * サーバーを実行し、致命的なエラーを処理
 *
 * 例:
 *   正常に開始 → サーバーは無期限に実行され、MCPリクエストを処理
 *   ポートが既に使用中 → "Fatal error running server: EADDRINUSE"
 *   依存関係が不足 → "Fatal error running server: Cannot find module"
 *   権限が拒否された → "Fatal error running server: EACCES"
 *   任意の致命的エラー → エラーをログに記録し、コード1で終了
 */
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
