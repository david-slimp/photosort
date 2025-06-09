# photosort

This repository contains a simple test page that lists Google Photos
albums. The OAuth *client ID* used by the page is loaded from a separate
configuration file so that your real credentials can stay outside of the
repository.

## Setup

1. Copy `client_config.js.example` to `.env/client_config.js`.
2. Edit `.env/client_config.js` and replace the placeholder with your own
   Google OAuth client ID.
3. Open `google_photos_test.html` in your browser.

The `.env` directory is ignored by Git, keeping your private client ID
out of version control.
