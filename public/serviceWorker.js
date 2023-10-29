/* eslint-disable no-undef */
const CACHE_VERSION = "v0.9.2";
const CACHE_NAME = `${registration.scope}!${CACHE_VERSION}`;

// キャッシュするファイルをセットする
const urlsToCache = ["index.html"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        // キャッシュを開く
        caches.open(CACHE_NAME).then((cache) => {
            // 指定されたファイルをキャッシュに追加する
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
        .then((keys) => {
            return keys.filter((key) => {
                return key.startsWith(`${registration.scope}!`) && key !== CACHE_NAME;
            });
        })
        .then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    return caches.delete(key);
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // キャッシュ内に該当レスポンスがあれば、それを返す
            if (response) {
                return response;
            }

            // 重要：リクエストを clone する。リクエストは Stream なので
            // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
            // 必要なので、リクエストは clone しないといけない
            let fetchRequest = event.request.clone();

            return fetch(fetchRequest).then((response) => {
                if (!response || response.status !== 200 || response.type !== "basic") {
                    // キャッシュする必要のないタイプのレスポンスならそのまま返す
                    return response;
                }

                // 重要：レスポンスを clone する。レスポンスは Stream で
                // ブラウザ用とキャッシュ用の2回必要。なので clone して
                // 2つの Stream があるようにする
                let responseToCache = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});
