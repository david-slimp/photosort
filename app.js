const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';
let tokenClient;
let gapiInited = false;
let gisInited = false;

// Initialize the Google API client library
function gapiLoaded() {
  console.log('Google API client loading...');
  gapi.load('client', initializeGapiClient);
}

// Initialize Google Identity Services
function gisLoaded() {
  console.log('Google Identity Services loading...');
  if (typeof google === 'undefined' || !google.accounts) {
    console.error('Google Identity Services not loaded');
    return;
  }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '' // to be set during authorization
  });
  gisInited = true;
  maybeEnableButtons();
}

// Initialize gapi client
async function initializeGapiClient() {
  try {
    await gapi.client.init({});
    await gapi.client.load('https://photoslibrary.googleapis.com/$discovery/rest?version=v1');
    gapiInited = true;
    maybeEnableButtons();
    console.log('Google API client initialized');
  } catch (error) {
    console.error('Error initializing Google API client:', error);
  }
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    gapi.client.setToken({ access_token: resp.access_token });
    document.getElementById('signout_button').style.display = 'inline';
    document.getElementById('authorize_button').innerText = 'Refresh';
    await listAlbums();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('authorize_button').onclick = handleAuthClick;
  document.getElementById('signout_button').onclick = handleSignoutClick;
});

async function listAlbums(pageToken) {
  try {
    const response = await gapi.client.request({
      path: 'https://photoslibrary.googleapis.com/v1/albums',
      method: 'GET',
      params: { pageSize: 50, pageToken: pageToken || '' }
    });

    const albums = response.result.albums || [];
    const albumsContainer = document.getElementById('albums');

    if (pageToken === undefined) {
      albumsContainer.innerHTML = '';
    }

    if (albums.length === 0 && pageToken === undefined) {
      albumsContainer.innerHTML = '<p>No albums found.</p>';
      return;
    }

    albums.forEach(album => {
      const albumElement = document.createElement('div');
      albumElement.className = 'album';
      albumElement.innerHTML = `
        <h3>${album.title || 'Untitled Album'}</h3>
        <p>${album.mediaItemsCount || 0} items</p>
        ${album.coverPhotoBaseUrl ? `<img src="${album.coverPhotoBaseUrl}=w200-h200" alt="Album cover" style="max-width: 200px; border: 1px solid #ddd; border-radius: 4px; margin: 5px 0;">` :
          '<div style="width:200px; height:150px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; margin:5px 0;">No cover photo</div>'}
      `;
      albumsContainer.appendChild(albumElement);
    });

    if (response.result.nextPageToken) {
      await listAlbums(response.result.nextPageToken);
    }
  } catch (error) {
    console.error('Error listing albums:', error);
    const errorMessage = error.result?.error?.message || error.message || 'Unknown error';
    document.getElementById('albums').innerHTML =
      `<p style="color: red;">Error loading albums: ${errorMessage}</p>`;
  }
}

function updateAuthUI(isSignedIn) {
  const authButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');

  if (isSignedIn) {
    authButton.innerText = 'Refresh';
    signoutButton.style.display = 'inline';
  } else {
    authButton.innerText = 'Sign In';
    signoutButton.style.display = 'none';
    document.getElementById('albums').innerHTML = '';
  }
}

async function initGooglePhotos() {
  try {
    await gapi.client.load('https://photoslibrary.googleapis.com/$discovery/rest?version=v1');
    console.log('Google Photos API initialized');
  } catch (error) {
    console.error('Error initializing Google Photos API:', error);
    document.getElementById('albums').innerHTML =
      `<p>Error initializing Google Photos API: ${error.message || 'Unknown error'}</p>`;
  }
}
