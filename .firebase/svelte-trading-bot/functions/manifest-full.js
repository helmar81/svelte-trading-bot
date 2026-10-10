export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["bitcoin.png","robots.txt"]),
	mimeTypes: {".png":"image/png",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.FOEBavJW.js",app:"_app/immutable/entry/app.CeW_RZWO.js",imports:["_app/immutable/entry/start.FOEBavJW.js","_app/immutable/chunks/CSfZ8Txc.js","_app/immutable/chunks/Dp8fLZvZ.js","_app/immutable/chunks/BYOW8CTc.js","_app/immutable/entry/app.CeW_RZWO.js","_app/immutable/chunks/CSfZ8Txc.js","_app/immutable/chunks/Dym5lGCj.js","_app/immutable/chunks/Eh1kA1Fj.js","_app/immutable/chunks/BYOW8CTc.js","_app/immutable/chunks/BC66r-j7.js","_app/immutable/chunks/tIjd0OXr.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
