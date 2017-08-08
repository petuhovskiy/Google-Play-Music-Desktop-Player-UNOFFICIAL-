import { scrobbleTrack } from './lastFM';

let playTime = 0;
let lastPosition = 0;
let currentTrack;

Emitter.on('change:track', (event, track) => {
  Logger.debug({
    event: 'change:track',
    prev: currentTrack,
    track,
  });
  currentTrack = track;
  playTime = 0;
  lastPosition = 0;
});

Emitter.on('change:playback-time', (event, playbackInfo) => {
  const progress = playbackInfo.current - lastPosition;
  lastPosition = playbackInfo.current;

  // Update time if slider wasn't moved manually
  if (progress > 0 && progress < 2000) {
    playTime += progress;
  }

  Logger.debug({
    event: 'change:playback-time',
    info: playbackInfo,
    progress,
    playTime,
  });

  // Scrobble if played more than half or 4 minutes
  if (playbackInfo.total !== 0 && (playTime / playbackInfo.total) > 0.5 || playTime > 1000 * 60 * 4) {
    Logger.debug('SCROBBLE EVENT!!!');

    scrobbleTrack({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
      duration: currentTrack.duration,
      timestamp: Math.round((Date.now() - playTime) / 1000),
    });
    playTime -= playbackInfo.total;
  }
});

Emitter.on('lastfm:scrobble-current', () => {
  scrobbleTrack({
    title: currentTrack.title,
    artist: currentTrack.artist,
    album: currentTrack.album,
    duration: currentTrack.duration,
    timestamp: Math.round(Date.now() / 1000),
  });
});
