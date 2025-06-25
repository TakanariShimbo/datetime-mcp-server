# DateTime MCP サーバー

現在の日付と時刻を様々な形式で取得するツールを提供する Model Context Protocol (MCP)サーバーです。このサーバーは MCP サーバーの基本構造を示しており、独自の MCP サーバーを作成する際の参考として使用できます。

## 機能

- 複数の形式での現在日時の取得（ISO、Unix タイムスタンプ、人間が読みやすい形式など）
- 環境変数による出力形式の設定
- タイムゾーンのサポート
- カスタム日付形式のサポート
- シンプルなツール：`get_current_time`

## 使用方法

ニーズに応じて以下の例から選択してください：

**基本的な使用方法（ISO形式）:**

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

**人間が読みやすい形式＋タイムゾーン指定:**

```json
{
  "mcpServers": {
    "datetime": {
      "command": "npx",
      "args": ["-y", "@takanarishimbo/datetime-mcp-server"],
      "env": {
        "DATETIME_FORMAT": "human",
        "TIMEZONE": "Asia/Tokyo"
      }
    }
  }
}
```

**Unixタイムスタンプ形式:**

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

**カスタム形式:**

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

## 設定

サーバーは環境変数を使用して設定できます：

### `DATETIME_FORMAT`

日時のデフォルト出力形式を制御します（デフォルト："iso"）

サポートされる形式：

- `iso`：ISO 8601 形式（2024-01-01T12:00:00.000Z）
- `unix`：秒単位の Unix タイムスタンプ
- `unix_ms`：ミリ秒単位の Unix タイムスタンプ
- `human`：人間が読みやすい形式（Mon, Jan 1, 2024 12:00:00 PM）
- `date`：日付のみ（2024-01-01）
- `time`：時刻のみ（12:00:00）
- `custom`：DATE_FORMAT_STRING 環境変数を使用したカスタム形式

### `DATE_FORMAT_STRING`

カスタム日付形式文字列（DATETIME_FORMAT="custom"の場合のみ使用）
デフォルト："YYYY-MM-DD HH:mm:ss"

サポートされるトークン：

- `YYYY`：4 桁の年
- `YY`：2 桁の年
- `MM`：2 桁の月
- `DD`：2 桁の日
- `HH`：2 桁の時（24 時間制）
- `mm`：2 桁の分
- `ss`：2 桁の秒

### `TIMEZONE`

使用するタイムゾーン（デフォルト：システムのタイムゾーン）
例："UTC"、"America/New_York"、"Asia/Tokyo"

## 利用可能なツール

### `get_current_time`

現在の日付と時刻を取得

パラメータ：

- `format`（オプション）：出力形式、DATETIME_FORMAT 環境変数を上書き
- `timezone`（オプション）：使用するタイムゾーン、TIMEZONE 環境変数を上書き


## 開発

### 方法1: Node.jsをローカルで使用

1. **このリポジトリをクローン**

   ```bash
   git clone https://github.com/TakanariShimbo/npx-datetime-mcp-server.git
   cd npx-datetime-mcp-server
   ```

2. **依存関係をインストール**

   ```bash
   npm ci
   ```

3. **プロジェクトをビルド**

   ```bash
   npm run build
   ```

4. **MCP Inspector でのテスト（オプション）**

   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

### 方法2: Docker を使用（ローカルに Node.js 不要）

ローカルに Node.js や npm がインストールされていない場合、Docker を使用してプロジェクトをビルドできます：

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/TakanariShimbo/npx-datetime-mcp-server.git
   cd npx-datetime-mcp-server
   ```

2. **ワンコマンドでビルドと抽出**

   ```bash
   # Docker 内でプロジェクトをビルドし、ローカルディレクトリに直接出力
   docker build -t datetime-mcp-build . && docker run --rm -v $(pwd):/app datetime-mcp-build
   ```

3. **サーバーを実行**

   ```bash
   # ビルドされたサーバーを Node.js で実行
   node dist/index.js
   
   # または環境変数を指定して実行
   DATETIME_FORMAT=human TIMEZONE=Asia/Tokyo node dist/index.js
   ```

## プロジェクト構造

```
npx-datetime-mcp-server/
├── index.ts              # メインサーバー実装
├── package.json          # パッケージ設定
├── tsconfig.json         # TypeScript設定
├── Dockerfile            # Docker設定
├── .gitignore            # Gitの無視ファイル
├── .github/
│   └── workflows/
│       └── npm-publish.yml   # NPM公開ワークフロー
├── scripts/
│   └── release.sh        # リリース自動化スクリプト
├── docs/
│   ├── README.md         # 英語版ドキュメント
│   └── README_ja.md      # このファイル
└── dist/                 # コンパイル済みJavaScript（ビルド後）
```

## ライセンス

MIT
