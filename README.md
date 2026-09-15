# LED Layout Generator v3.16 — GitHub Pages

This folder is ready to publish as a static GitHub Pages website. It does not
need Python, a server, a database, or a ChatGPT account.

## Publish it

1. Sign in to GitHub and create a new repository.
2. On the repository page, choose **Add file → Upload files**.
3. Upload the contents of this folder, including `.nojekyll`, and commit them
   to the `main` branch. Files such as `index.html` must be at the repository
   root, not inside another folder.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select the `main` branch and `/ (root)`, then choose **Save**.
7. GitHub will show the public website address after deployment finishes.

For a repository named `led-layout`, the address normally looks like:

`https://YOUR-USERNAME.github.io/led-layout/`

## Updating the website

Upload the newer files to the same repository and commit them. GitHub Pages
will publish the update automatically. The service worker uses a versioned
cache, so users should close and reopen the installed web app while online
after an update.

## Storage and privacy

Projects are stored in the browser on each device. They are not uploaded to
GitHub. Use **Save project** to keep JSON backups. Clearing browser site data
can remove locally stored projects.

## Custom domain

After the site works at the GitHub address, enter a domain such as
`layout.example.com` in **Settings → Pages → Custom domain** and follow the DNS
instructions shown by GitHub.
