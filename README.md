# 岩尊降臨 — ねむれる神の八分間

岩尊けいとの部屋を舞台にした、ブラウザ用サバイバルアクション。会話で完成した **v1.2.0のゲーム性・キャラクター・攻撃演出・敵バランスを維持**し、Viteで開発・ビルドできるプロジェクトに整理しました。

- リポジトリ：https://github.com/sunnytruck/keito-survivor
- GitHub Pagesの公開先：https://sunnytruck.github.io/keito-survivor/
- 移行日：2026-10-19。初回公開には下記のPages設定が必要です。

## ローカルで遊ぶ・開発する

Node.js **24 LTS推奨**（最低22.12.0）とGitを用意し、ターミナルで実行します。

```sh
git clone https://github.com/sunnytruck/keito-survivor.git
cd keito-survivor
npm ci
npm run dev
```

ターミナルに表示されるURL（通常 `http://localhost:5173/keito-survivor/`）をブラウザで開いてください。終了はターミナルで `Ctrl+C`。`npm run dev -- --open` でブラウザも開けます。

本番用の出力を試す場合：

```sh
npm run build
npm run preview
```

表示されるURL（通常 `http://localhost:4173/keito-survivor/`）を開きます。配信ファイルは `dist/` に生成されます。

## GitHub Pagesの初回設定

1. [Settings → Pages](https://github.com/sunnytruck/keito-survivor/settings/pages) を開きます。
2. **Build and deployment → Source** を **GitHub Actions** にします。
3. [Actions](https://github.com/sunnytruck/keito-survivor/actions/workflows/deploy.yml) の **Deploy game to GitHub Pages → Run workflow → main → Run workflow** を実行します。
4. `build` と `deploy` の成功後、https://sunnytruck.github.io/keito-survivor/ を開きます。

以後は **mainへのpushでテスト → ビルド → 公開が自動実行**されます。プルリクエストではテストとビルドのみ実行します。個人用アクセストークンやSecretsの追加は不要です。PagesのSource設定をしていない場合はデプロイジョブが失敗するので、設定後にActionsから再実行してください。

`vite.config.mjs` の `base: '/keito-survivor/'` が公開先のサブディレクトリに対応します。リポジトリ名を変えた場合はこの値も変更してください。別の配信先へ一度だけビルドする場合は `npm run build -- --base=/別のパス/` を使えます。

## Codexなどで更新する

このリポジトリを開き、`src/` と `index.html` を編集します。`npm run verify` で確認し、コミットしてmainにpushすれば同じURLが更新されます。ビルド生成物の `dist/` と `node_modules/` はコミットしません。

```sh
npm run verify
git add .
git commit -m "Update game"
git push origin main
```

## 操作とルール

| 操作 | 内容 |
|---|---|
| WASD / 矢印キー | 移動。斜め移動の速度は同じ |
| スマホで画面をドラッグ | タッチ移動 |
| 攻撃 | 自動。足元の半径10の円だけがダメージ判定 |
| 緑の信仰 | 経験値。レベルアップで一時停止し、3択から強化 |
| 1 / 2 / 3 | 強化カードを選択 |
| Esc / P | ポーズ・再開 |
| M | ミュート切り替え |
| 設定 | 音量・ミュート・揺れ・ダメージ数字・顔画像とトリミング |

通常進行8分で最終ボス「夜更かしの化身」が出現し、撃破でクリア。HPが0ならゲームオーバーになり、すぐ再挑戦できます。3分・6分の中ボスが落とす神宝から進化できます。

### 御業・加護・進化

攻撃は最大6枠、補助は最大4枠、各Lv.5まで。最大Lvの能力と、枠が満杯の種類の未所持能力は通常候補から除外します。

| 攻撃 | 役割 |
|---|---|
| 神託・うきき（初期） | 敵方向への音波。成長で全方向攻撃へ |
| 御神岩 | 大きな貫通岩・複数発射による群れ崩し |
| 強制画面共有 | マークした敵へのダメージを共有。再帰連鎖はしない |
| 朝活の後光 | 周囲への継続攻撃。移動で範囲拡大 |
| 御神睡 | 停止後に昼寝、寝息攻撃と回復。移動で即解除 |
| 御尊顔 | 半透明の巨大な顔で範囲ダメージ・ノックバック |

補助は **冷ややかな眼差し / 信者の献身 / 早寝早起き / 岩尊フィーバー** の4種です。

| Lv.5の攻撃＋所持補助 | 神宝で進化 |
|---|---|
| 御神睡＋早寝早起き | 八時かねんねやな |
| 強制画面共有＋冷ややかな眼差し | 共有して。見てないけど。 |
| 御神岩＋岩尊フィーバー | 確変・岩尊降臨 |

進化は元の枠を置き換えます。画面内の「御業・進化の手引き」と強化カードに具体的な効果・数値を表示します。

### v1.2の敵バランスと演出を維持

- 敵は1分ごとに強化。時計の通常個体のHPは開始時20、4分900、6分4800、8分13000。出現済みの敵のHPは突然増えません。
- 後半の通常出現上限520体。2分以降は同段階の通常個体のHP2.4倍の精鋭が混ざります。
- 接近・突進・遠距離・耐久型、攻撃予告、中ボスHP6000 / 14000、最終ボスHP36000を維持。
- 60体撃破の神威解放、連続撃破、技名カットイン、着弾・粉砕・レベルアップ・進化・ボス撃破演出、Web Audioの音楽・効果音を維持。
- 部屋が神殿へ変化する背景、衣装と歩行・顔揺れ、敵弾が手前に出る描画順、勝利時に寝るけいとと祝う信者を維持。
- 画面外の弾・エフェクト整理、上限管理、HP・経験値・時間・撃破数・装備の表示、音量・揺れ設定・写真差し替え・自己ベスト保存を維持。

## 素材・保存データ

元の添付は本人写真ではなく「じっと教」のイラストだったため、同じ添付画像 `src/assets/iwason-original.jpeg` を使います。設定から本人写真に差し替え、切り抜き位置と拡大率を調整できます。架空の本人写真は作成していません。

敵・家具・神殿・体・技・UIは元のCanvas / SVG表現、音はWeb Audioの合成音です。画像はビルドへ同梱します。既存のGoogle Fontsは読み込めない場合にシステムフォントへフォールバックします。

差し替え写真・設定・自己ベストはブラウザのlocalStorageへ保存します。アップロードAPIはありません。保存先はブラウザとサイトのオリジンごとに分かれるため、従来のSites URLや別端末の保存データは自動で引き継ぎません。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | 元の日本語画面・HUD・モーダル・SVGアイコン |
| `src/engine.mjs` | 戦闘、6攻撃・4補助、進化、敵、ボス、勝敗、リセット |
| `src/art.mjs` | 顔・体・敵・背景・攻撃・勝利のCanvas描画 |
| `src/app.mjs` | UI、入力、音楽・効果音、設定、保存 |
| `src/style.css` | 元のUI・文字・カットイン・レスポンシブ表示 |
| `src/assets/` | 添付画像 |
| `vite.config.mjs` | GitHub Pagesのbaseとビルド設定 |
| `.github/workflows/deploy.yml` | 回帰テスト・ビルド・Pages自動デプロイ |
| `tests/` | ゲーム・UI接続・ビルド成果物・自然進行シミュレーション |
| `verification/` | 元v1.2の検証記録・照合用ハッシュ |

Reactへの書き換えは行わず、既存のCanvas＋JavaScriptをViteで扱います。配信時にはNode.jsやサーバーAPIは不要です。

## 検証

```sh
npm run verify             # 戦闘・UI → ビルド → 本番成果物・本番UI
npm run verify:migration   # 元v1.2との完全一致（URL変更を除外）
npm run test:balance       # 無敵・HP補充・時間スキップなしの自動入力
```

`npm test` は23項目の戦闘テストと12項目のアプリ接続テストを実行します。移動、自動攻撃、信仰回収、強化選択、6攻撃・4補助、3進化、3/6/8分ボス、クリア、敗北、再挑戦の敵・タイマー消去を含みます。アプリ接続は実際のモジュールとnative Canvasを使い、ビルド後にも同じテストを実行します。

本番パス検証では `/keito-survivor/` からのJS・CSS・顔画像の参照、画像のバイト一致、全UI要素の残存を確認します。実ブラウザのレイアウト・音声・実機性能を確認するテストとは区別しています。

元版の調整・自動入力の結果は [v1.2時点の記録](verification/HISTORY-v1.2.md) に保存しています。記録内の `dist/` は移行前のソース配置です。

## 構成の参照資料（2026-10-19確認）

- [Vite: GitHub Pagesへの静的デプロイ](https://vite.dev/guide/static-deploy.html#github-pages)
- [GitHub: カスタムワークフローによるPagesのデプロイ](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub: 公開ソースの設定](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
