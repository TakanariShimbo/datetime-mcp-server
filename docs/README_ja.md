[English](README.md) | [日本語](README_ja.md) | **README**

# DateTime MCP サーバー

現在の日付と時刻を様々な形式で取得するツールを提供する Model Context Protocol (MCP)サーバーです。これは datetime MCP サーバーの TypeScript 実装で、TypeScript SDK を使用して MCP サーバーを構築する方法を示しています。

## 機能

- 複数の形式での現在日時の取得（ISO、Unix タイムスタンプ、人間が読みやすい形式など）
- 環境変数による出力形式の設定
- タイムゾーンのサポート
- カスタム日付形式のサポート
- シンプルなツール：`get_current_time`

## 使用方法

ニーズに応じて以下の例から選択してください：

**基本的な使用方法（ISO 形式）:**

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

**Unix タイムスタンプ形式:**

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

## NPM への公開

このプロジェクトは GitHub Actions を使用した自動 NPM 公開を含んでいます。公開を設定するには：

### 1. NPM アクセストークンの作成

1. **NPM にログイン**（必要に応じてアカウントを作成）

   ```bash
   npm login
   ```

2. **アクセストークンの作成**
   - https://www.npmjs.com/settings/tokens にアクセス
   - 「Generate New Token」をクリック
   - 「Automation」を選択（CI/CD 用）
   - 「Publish」権限レベルを選択
   - 生成されたトークンをコピー（`npm_`で始まる）

### 2. GitHub リポジトリにトークンを追加

1. **リポジトリ設定に移動**

   - GitHub リポジトリに移動
   - 「Settings」タブをクリック
   - 「Secrets and variables」→「Actions」に移動

2. **NPM トークンを追加**
   - 「New repository secret」をクリック
   - Name: `NPM_TOKEN`
   - Value: ステップ 1 でコピーした NPM トークンを貼り付け
   - 「Add secret」をクリック

### 3. GitHub パーソナルアクセストークンの設定（リリーススクリプト用）

リリーススクリプトは GitHub にプッシュする必要があるため、GitHub トークンが必要です：

1. **GitHub パーソナルアクセストークンの作成**

   - https://github.com/settings/tokens にアクセス
   - 「Generate new token」→「Generate new token (classic)」をクリック
   - 有効期限を設定（推奨：90 日またはカスタム）
   - スコープを選択：
     - ✅ `repo`（プライベートリポジトリのフルコントロール）
   - 「Generate token」をクリック
   - 生成されたトークンをコピー（`ghp_`で始まる）

2. **Git にトークンを設定**

   ```bash
   # オプション1：GitHub CLIを使用（推奨）
   gh auth login

   # オプション2：gitを設定してトークンを使用
   git config --global credential.helper store
   # パスワードを求められたら、代わりにトークンを使用
   ```

### 4. 新しいバージョンのリリース

付属のリリーススクリプトを使用して、自動的にバージョン管理、タグ付け、公開をトリガー：

```bash
# パッチバージョンを増分（0.1.0 → 0.1.1）
npm run release patch

# マイナーバージョンを増分（0.1.0 → 0.2.0）
npm run release minor

# メジャーバージョンを増分（0.1.0 → 1.0.0）
npm run release major

# 特定のバージョンを設定
npm run release 1.2.3
```

### 5. 公開の確認

1. **GitHub Actions を確認**

   - リポジトリの「Actions」タブに移動
   - 「Publish to npm」ワークフローが正常に完了したことを確認

2. **NPM パッケージを確認**
   - 訪問：https://www.npmjs.com/package/@takanarishimbo/datetime-mcp-server
   - または実行：`npm view @takanarishimbo/datetime-mcp-server`

### リリースプロセスフロー

1. `release.sh`スクリプトがすべてのファイルのバージョンを更新
2. git コミットとタグを作成
3. GitHub にプッシュ
4. 新しいタグで GitHub Actions ワークフローがトリガー
5. ワークフローがプロジェクトをビルドして NPM に公開
6. パッケージが`npm install`でグローバルに利用可能になる

## プロジェクト構造

```
npx-datetime-mcp-server/
├── src/
│   └── index.ts          # メインサーバー実装
├── package.json          # パッケージ設定
├── package-lock.json
├── tsconfig.json         # TypeScript設定
├── .github/
│   └── workflows/
│       └── npm-publish.yml   # NPM公開ワークフロー
├── scripts/
│   └── release.sh        # リリース自動化スクリプト
├── docs/
│   ├── README.md         # 英語版ドキュメント
│   └── README_ja.md      # このファイル
└── .gitignore            # Gitの無視ファイル
```

## ライセンス

MIT
