# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Market analysis configuration

Live analysis uses the Jev API and requires `JEV_API_KEY` in the server environment. Set it in a local `.env` file for development and configure it as a server-side environment variable for deployment. Do not expose this key through a `VITE_` variable. If it is missing, the analysis endpoint reports a configuration error rather than returning sample signals.

## Progressive web app

The app includes a web manifest and a service worker that caches the app shell and static assets for offline loading. Live market data and `/api` requests are not cached and require a network connection. Installability and service workers require HTTPS in production (localhost is supported for development).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv create --template minimal --types ts --install npm svelte
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
