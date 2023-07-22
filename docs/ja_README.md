# mahiro

## インストール

1. サーバーのセットアップ

```bash
$ cd path/to/mihari
$ python -m venv venv
$ . ./venv/bin/activate
(venv) $ pip install pipenv
(venv) $ pipenv install
```

2. クライアントのセットアップ

```bash
$ cd path/to/mihari/client
$ npm install
$ npm run build
```

## 実行

`8000`番ポートでHTTPサーバーが起動します。

```bash
$ cd path/to/mihari
$ python -m venv venv
$ . ./venv/bin/activate
(venv) $ python main.py
```
