import { build, files, version } from '$service-worker';

const CACHE_PREFIX = 'trading-bot';
const CACHE_NAME = `${CACHE_PREFIX}-${version}`;
const PRECACHE_URLS = [...build, ...files, '/'];

function cacheResponse(request, response, event) {
	const cacheWrite = caches
		.open(CACHE_NAME)
		.then((cache) => cache.put(request, response.clone()));

	event.waitUntil(
		cacheWrite.catch((error) => {
			console.error(`Failed to cache ${request.url}:`, error);
		})
	);
}

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && key !== CACHE_NAME)
					.map((key) => caches.delete(key))
			)
		)
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	if (
		request.method !== 'GET' ||
		url.origin !== self.location.origin ||
		url.pathname === '/api' ||
		url.pathname.startsWith('/api/')
	) {
		return;
	}

	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request)
				.then((response) => {
					if (response.ok && response.type === 'basic') {
						cacheResponse(request, response, event);
					}
					return response;
				})
				.catch(async () => {
					const cachedPage = await caches.match(request);
					if (cachedPage) return cachedPage;

					const cachedHomePage = await caches.match('/');
					if (cachedHomePage) return cachedHomePage;

					return Response.error();
				})
		);
		return;
	}

	if (['font', 'image', 'script', 'style'].includes(request.destination)) {
		event.respondWith(
			caches.match(request).then((cachedResponse) => {
				if (cachedResponse) return cachedResponse;

				return fetch(request).then((response) => {
					if (response.ok && response.type === 'basic') {
						cacheResponse(request, response, event);
					}
					return response;
				});
			})
		);
	}
});
