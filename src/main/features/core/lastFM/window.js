import { BrowserWindow } from 'electron';
import path from 'path';

const windowName = 'lastfm-info';

const openLastFmWindow = () => {
  if (WindowManager.getAll(windowName).length > 0) {
    WindowManager.getAll(windowName)[0].show();
    return;
  }

  const infoLastFM = new BrowserWindow({
    width: 300,
    height: 300,
    autoHideMenuBar: true,
    frame: Settings.get('nativeFrame'),
    titleBarStyle: Settings.get('nativeFrame') && process.platform === 'darwin' ? 'hidden' : 'default',
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: path.resolve(`${__dirname}/../../../../assets/img/main.${(process.platform === 'win32' ? 'ico' : 'png')}`), // eslint-disable-line
    title: 'Settings',
  });
  infoLastFM.loadURL(`file://${__dirname}/../../../../public_html/lastfm_info.html`);

  WindowManager.add(infoLastFM, windowName);
  WindowManager.forceFocus(infoLastFM);
};

Emitter.on('lastfm:button', () => {
  openLastFmWindow();
});

const send = (event, ...details) => {
  Emitter.sendToWindowsOfName(windowName, event, ...details);
};

export const updateTrackInfo = (track) => {
  send('lastfm:track-change', track);
};

export const updateTrackLastFmInfo = (track) => {
  Logger.debug(track);
};

export const updateTimeBeforeScrobble = (time) => {
  send('lastfm:update-time-before-scrobble', time);
};

export const scrobbleEvent = (track, date) => {
  send('lastfm:scrobble-event', {
    track,
    date,
  });
};
