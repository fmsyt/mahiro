# コンパイル

## 1. クライアントアプリケーションのビルド

```bash
cd path/to/mahiro/client
npm run build
```

## 2. Nuitkaをインストール

```bash
cd path/to/mahiro
./venv/bin/pip install nuitka
```

## 3. サーバーアプリケーションのコンパイル

```bash
./venv/bin/nuitka --onefile --follow-imports --include-data-dir=public=public --output-dir=build --output-filename=mahiro --windows-icon-from-ico=client/public/favicon.ico main.py
```
