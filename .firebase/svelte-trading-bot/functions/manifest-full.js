export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["bitcoin.png","icon-192.png","icon-512.png","robots.txt"]),
	mimeTypes: {".png":"image/png",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.FgvKAyxK.js",app:"_app/immutable/entry/app.BbH6JT7-.js",imports:["_app/immutable/entry/start.FgvKAyxK.js","_app/immutable/chunks/CfYcps2Z.js","_app/immutable/chunks/C-bp1zUS.js","_app/immutable/chunks/rK8fjm6k.js","_app/immutable/entry/app.BbH6JT7-.js","_app/immutable/chunks/CfYcps2Z.js","_app/immutable/chunks/BaW2Y-Rr.js","_app/immutable/chunks/Dou5NfBp.js","_app/immutable/chunks/rK8fjm6k.js","_app/immutable/chunks/CTy_ACC4.js","_app/immutable/chunks/BLjYWYc3.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
