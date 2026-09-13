# Deploying the iPad PWA

The folder is a static website. It can be hosted by any HTTPS static web host.

## GitHub Pages

1. Create a new GitHub repository.
2. Upload every file and folder from this PWA package to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/ (root)`, then save.
6. Open the HTTPS Pages address in **Safari on the iPad**.
7. Tap **Share → Add to Home Screen**.

## Other hosts

You can also upload this exact folder to a static HTTPS host such as Netlify,
Cloudflare Pages, a company web server, or another HTTPS-capable server.

The service worker uses relative paths, so the app can also be hosted inside
a subfolder rather than at the website root.

## Updating later

Replace the hosted files with the newer PWA version. The service worker's
cache version will change when I release an update, so the updated app files
will replace the old offline cache.
