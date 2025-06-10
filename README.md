# photosort

This repository contains a simple test page that lists Google Photos
albums. The OAuth *client ID* used by the page is loaded from a separate
configuration file so that your real credentials can stay outside of the
repository.

## Setup

1. Copy `client_config.js.example` to `.env/client_config.js`.
2. Edit `.env/client_config.js` and replace the placeholder with your own
   Google OAuth client ID.

3. Start a local web server so the page is served from
   `http://localhost:8080` (the URL registered in Google Cloud Console):

   ```bash
   python3 -m http.server 8080
   ```
4. Open `http://localhost:8080/google_photos_test.html` in your browser.

The `.env` directory is ignored by Git, keeping your private client ID out of
version control.
