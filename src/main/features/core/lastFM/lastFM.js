import { BrowserWindow } from 'electron';
import { LastFmNode } from 'lastfm';
import path from 'path';

import { LASTFM_API_KEY, LASTFM_API_SECRET } from '../../../constants';

const lastfm = new LastFmNode({
  api_key: LASTFM_API_KEY,
  secret: LASTFM_API_SECRET,
  useragent: 'GPMDP',
});

const getLastFMToken = () =>
  new Promise((resolve, reject) => {
    lastfm.request('auth.getToken')
      .on('success', (json) => {
        resolve(json.token);
      })
      .on('error', () => {
        reject();
      });
  });

const authLastFMToken = (token) =>
  new Promise((resolve, reject) => {
    const authWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      center: true,
      show: false,
      autoHideMenuBar: true,
      frame: Settings.get('nativeFrame'),
      icon: path.resolve(`${__dirname}/../../../../assets/img/main.${(process.platform === 'win32' ? 'ico' : 'png')}`), // eslint-disable-line
      title: 'Last.FM',
      webPreferences: {
        nodeIntegration: false,
        preload: path.resolve(`${__dirname}/../../../../renderer/lastFM.js`),
      },
    });
    authWindow.setMenu(null);
    authWindow.loadURL(`http://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}&token=${token}`);
    Emitter.once('lastfm:auth_result', (event, accepted) => {
      if (accepted.result) {
        resolve(token);
      } else {
        reject();
      }
    });
  });

export const getLastFMSession = () =>
  new Promise((resolve, reject) => {
    if (global.lastFMSession && Settings.get('lastFMKey')) {
      resolve(global.lastFMSession);
    } else if (Settings.get('lastFMKey')) {
      global.lastFMSession = lastfm.session({
        key: Settings.get('lastFMKey'),
        user: Settings.get('lastFMUser'),
      });
      resolve(global.lastFMSession);
    } else {
      getLastFMToken()
        .then((token) => authLastFMToken(token))
        .then((token) => {
          lastfm.session({
            token,
          })
            .on('success', (session) => {
              global.lastFMSession = session;
              Settings.set('lastFMKey', session.key);
              Settings.set('lastFMUser', session.user);
              resolve(session);
            })
            .on('error', reject);
        })
        .catch(reject);
    }
  });

// const resetLastFM = () => {
//   Settings.set('lastFMKey', null);
//   Settings.set('lastFMUser', null);
//   delete global.lastFMSession;
//   getLastFMSession();
// };

Emitter.on('lastfm:auth', () => {
  getLastFMSession()
    .then(() => {
      Emitter.sendToAll('lastfm:authcomplete', { result: true });
    })
    .catch(() => {
      Emitter.sendToAll('lastfm:authcomplete', { result: false });
    });
});

const updateNowPlaying = (track) => {
  if (Settings.get('lastFMKey')) {
    getLastFMSession()
      .then((session) => {
        lastfm.update('nowplaying', session, {
          track: track.title,
          artist: track.artist,
          album: track.album,
          duration: track.duration,
        }).on('error', (err) => Logger.error('LASTFM ERROR', err));
      })
      .catch((err) => Logger.error('LASTFM ERROR', err));
  }
};

const updateScrobble = (track, timestamp) => {
  if (Settings.get('lastFMKey')) {
    Logger.debug('updateScrobble', track);
    getLastFMSession()
      .then((session) => {
        lastfm.update('scrobble', session, {
          track: track.title,
          artist: track.artist,
          album: track.album,
          duration: track.duration,
          timestamp,
        })
        .on('error', (err) => Logger.error('LASTFM ERROR', err))
        .on('success', (details) => Logger.debug('success', details))
        .on('retrying', (details) => Logger.debug('retrying', details));
      })
      .catch((err) => Logger.error('LASTFM ERROR', err));
  }
};

const fixTrack = (_track) => {
  const track = Object.assign({}, _track);
  if (track.album === 'Unknown Album') track.album = undefined;
  track.duration = Math.round(track.duration / 1000);
  return track;
};

export const scrobbleTrack = (_track, timestamp) => {
  const track = fixTrack(_track);
  if (track.duration < 30) return;
  updateScrobble(track, timestamp);
};

export const nowPlayingTrack = (track) => {
  updateNowPlaying(fixTrack(track));
};
