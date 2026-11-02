export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["bitcoin.png","icon-192.png","icon-512.png","manifest.webmanifest","privacy.html","robots.txt","service-worker.js"]),
	mimeTypes: {".png":"image/png",".webmanifest":"application/manifest+json",".html":"text/html",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.AxTopii5.js",app:"_app/immutable/entry/app.DyxSTCig.js",imports:["_app/immutable/entry/start.AxTopii5.js","_app/immutable/chunks/7oVo2CX8.js","_app/immutable/chunks/dO4P4f3d.js","_app/immutable/entry/app.DyxSTCig.js","_app/immutable/chunks/7oVo2CX8.js","_app/immutable/chunks/DiyNSr9J.js","_app/immutable/chunks/DUYhzLm4.js","_app/immutable/chunks/C5Ihx8p4.js","_app/immutable/chunks/CHSkHmU9.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/agent",
				pattern: /^\/api\/agent\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/agent/_server.ts.js'))
			},
			{
				id: "/api/analyze",
				pattern: /^\/api\/analyze\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/analyze/_server.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
