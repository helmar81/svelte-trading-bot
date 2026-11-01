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
		client: {start:"_app/immutable/entry/start.B69UrMkH.js",app:"_app/immutable/entry/app.yOwDsYG1.js",imports:["_app/immutable/entry/start.B69UrMkH.js","_app/immutable/chunks/0M3a6nzG.js","_app/immutable/chunks/Df3v4rzy.js","_app/immutable/entry/app.yOwDsYG1.js","_app/immutable/chunks/0M3a6nzG.js","_app/immutable/chunks/lyZ0_aPU.js","_app/immutable/chunks/BzgCUJPq.js","_app/immutable/chunks/8zOZgcz7.js","_app/immutable/chunks/nwz-Ioju.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
