// ============================================
// Service Worker - My memo PWA
// ============================================

const CACHE_NAME = 'my-memo-v2';

// 캐시할 파일 목록
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/sw-register.js',
  '/manifest.json',
  '/icons/icon 192_192.png',
  '/icons/icon 512_512.png'
];

// ============================================
// Service Worker 설치
// ============================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 설치 중...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 파일 캐싱 중...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] 모든 파일 캐싱 완료');
        return self.skipWaiting(); // 즉시 활성화
      })
  );
});

// ============================================
// Service Worker 활성화
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 활성화 중...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 오래된 캐시 삭제
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] 오래된 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] 활성화 완료');
        return self.clients.claim(); // 즉시 제어 시작
      })
  );
});

// ============================================
// 네트워크 요청 가로채기
// ============================================
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시된 응답 반환
        if (response) {
          console.log('[Service Worker] 캐시에서 반환:', event.request.url);
          return response;
        }

        // 캐시에 없으면 네트워크에서 가져오기
        console.log('[Service Worker] 네트워크에서 가져오기:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // 응답이 유효하지 않으면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답을 복제하여 캐시에 저장
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // 네트워크 요청 실패 시 (오프라인)
            console.log('[Service Worker] 네트워크 요청 실패 (오프라인)');

            // HTML 요청이면 index.html 반환
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});
