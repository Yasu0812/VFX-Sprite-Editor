# VFX Sprite Editor

VFX Sprite Editor は、**スプライトシートからアニメーション用フレーム情報を作成・調整し、JSON で書き出せる**ブラウザベースのツールです。  
React + TypeScript + Canvas で実装されており、ローカルで軽快に動作します。

## 主な機能

- **PNG スプライトシート読み込み**
  - PNG 画像をアップロードして、元解像度を維持したまま編集可能
- **フレーム選択モード**
  - 矩形ドラッグで任意領域を 1 フレームとして追加
  - 列 / 行指定でセル単位のフレーム追加
  - 「左上→右下」の一括追加にも対応
- **グリッドとピボット編集**
  - フレーム幅 / 高さの調整
  - ピボットを正規化座標（0〜1）で管理
- **トリミング / ビューポート制御**
  - 透明領域の自動トリム
  - マージン / アルファ閾値の調整
  - オリジナル画像境界の表示切り替え
- **再生プレビュー**
  - Play / Pause、Loop、FPS 調整
  - 先頭 / 末尾ジャンプ
  - オニオンスキン表示
- **フレーム詳細編集**
  - duration（ms）
  - scale / rotation / alpha
  - tween（補間フレーム、scaleTo / rotationTo / alphaTo）
  - 並び替え（Up / Down）・削除
- **エクスポート**
  - フレーム配列・再生設定・描画設定・トリム情報を含む JSON を出力

## 技術スタック

- React 19
- TypeScript 5
- Vite 7
- HTML5 Canvas

## セットアップ

### 前提

- Node.js 18 以上推奨
- npm

### インストールと起動

```bash
npm install
npm run dev
```

## 利用可能なスクリプト

```bash
npm run dev      # 開発サーバー起動
npm run build    # TypeScript ビルド + 本番バンドル
npm run lint     # ESLint
npm run preview  # build成果物のプレビュー
```

## 使い方（クイックスタート）

1. **Upload PNG Sprite Sheet** で画像を読み込む
2. 左ペインでフレームを選択して追加
   - Rectangle Selection もしくは Column / Row Selection
3. 右ペインで再生設定や各フレームのパラメータを調整
4. **Export JSON** で設定を保存

## 出力 JSON に含まれる主な情報

- グリッド情報（frameWidth / frameHeight / cols / rows）
- 再生情報（fps / loop）
- ピボット（pivotX / pivotY）
- 描画情報（blendMode / opacity / scale）
- フレーム配列（位置・サイズ）
- トリム情報（offset / width / height / margin）
- rawFrames（duration / tween 等を含む詳細）

## プロジェクト構成

```text
src/
├── components/
│   ├── SpriteLoader.tsx
│   ├── GridOverlay.tsx
│   ├── PreviewCanvas.tsx
│   └── ControlsPanel.tsx
├── hooks/
│   └── useAnimationPlayback.ts
├── utils/
│   ├── canvasRender.ts
│   ├── trimLogic.ts
│   └── canvas.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## ライセンス

MIT
