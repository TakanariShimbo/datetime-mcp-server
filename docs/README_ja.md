# DateTime MCP サーバー

現在の日付と時刻を様々な形式で取得するツールを提供する Model Context Protocol (MCP)サーバーです。このサーバーは MCP サーバーの基本構造を示しており、独自の MCP サーバーを作成する際の参考として使用できます。

## 機能

- 複数の形式での現在日時の取得（ISO、Unix タイムスタンプ、人間が読みやすい形式など）
- 環境変数による出力形式の設定
- タイムゾーンのサポート
- カスタム日付形式のサポート
- シンプルなツール：`get_current_time`

## クイックスタート

1. **このリポジトリをクローン**

   ```bash
   git clone https://github.com/TakanariShimbo/datetime-mcp-server.git
   cd datetime-mcp-server
   ```

2. **依存関係をインストール**

   ```bash
   npm install
   ```

3. **プロジェクトをビルド**

   ```bash
   npm run build
   ```

4. **ローカルでテスト**
   ```bash
   npm start
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

## 使用例

### 基本的な使用方法

```bash
node dist/index.js
```

### カスタム形式での使用

```bash
DATETIME_FORMAT=human node dist/index.js
```

### タイムゾーン指定での使用

```bash
DATETIME_FORMAT=iso TIMEZONE=Asia/Tokyo node dist/index.js
```

### カスタム形式文字列での使用

```bash
DATETIME_FORMAT=custom DATE_FORMAT_STRING="YYYY/MM/DD HH:mm" node dist/index.js
```

## Claude Desktop との統合

Claude Desktop の設定に追加：

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

## 利用可能なツール

### `get_current_time`

現在の日付と時刻を取得

パラメータ：

- `format`（オプション）：出力形式、DATETIME_FORMAT 環境変数を上書き
- `timezone`（オプション）：使用するタイムゾーン、TIMEZONE 環境変数を上書き

## 開発

### プロジェクトのビルド

```bash
npm run build
```

TypeScript ファイルを`dist/`ディレクトリ内の JavaScript にコンパイルします。

### MCP Inspector でのテスト

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## 独自の MCP サーバーの作成

この例を基に独自の MCP サーバーを作成するには：

1. `package.json`を更新：

   - `name`フィールドを変更（@username/package-name 形式を使用）
   - `description`、`author`、その他のメタデータを更新
   - repository、bugs、homepage の URL を追加

2. `index.ts`を修正：

   - サーバー名とバージョンを変更
   - 独自のツールを追加
   - カスタムロジックを実装

3. 設定ファイルを更新：

   - `Dockerfile`：必要に応じて依存関係を調整
   - GitHub ワークフロー：異なる CI/CD が必要な場合は更新

4. ドキュメントを更新：

   - この README をあなたのサーバーのドキュメントで置き換え

5. 公開設定：
   - npm アカウントを作成してアクセストークンを生成
   - NPM_TOKEN を GitHub リポジトリのシークレットに追加
   - `npm run release`を使用して新しいバージョンを公開

## プロジェクト構造

```
datetime-mcp-server/
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
