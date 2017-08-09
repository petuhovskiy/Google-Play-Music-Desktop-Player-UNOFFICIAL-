import { scrobbleTrack, nowPlayingTrack } from './lastFM';
import { updateTrackInfo, updateTimeBeforeScrobble, scrobbleEvent } from './window';

const MINUTES_4 = 1000 * 60 * 4;

let playTime = 0;
let lastPosition = 0;
let currentTrack = {};

let lastNowPlayingUpdate = 0;

const updateNowPlaying = () => {
  lastNowPlayingUpdate = Date.now();
  nowPlayingTrack(currentTrack);
};

Emitter.on('change:track', (event, track) => {
  currentTrack = track;
  playTime = 0;
  lastPosition = 0;

  updateNowPlaying();
  updateTrackInfo(track);
});

Emitter.on('change:playback-time', (event, playbackInfo) => {
  const scrobbleTarget = playbackInfo.total * 0.5;
  const progress = playbackInfo.current - lastPosition;
  lastPosition = playbackInfo.current;

  if (Date.now() - lastNowPlayingUpdate > currentTrack.duration) {
    updateNowPlaying();
  }

  // Update time if slider wasn't moved manually
  if (progress > 0 && progress < 2000) {
    playTime += progress;
  }

  updateTimeBeforeScrobble(Math.max(0, Math.min(scrobbleTarget, MINUTES_4) - playTime));

  // Scrobble if played more than half or 4 minutes
  if (playbackInfo.total !== 0 && playTime > scrobbleTarget || playTime > MINUTES_4) {
    const timestamp = Math.round((Date.now() - playTime) / 1000);
    scrobbleEvent(currentTrack, Date.now());
    scrobbleTrack(currentTrack, timestamp);

    playTime -= playbackInfo.total;
  }
});

Emitter.on('lastfm:scrobble-current', () => {
  scrobbleTrack(currentTrack, Math.round(Date.now() / 1000));
});
