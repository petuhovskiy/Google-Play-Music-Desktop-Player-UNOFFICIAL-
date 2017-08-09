import React, { Component } from 'react';
// import { Tabs, Tab } from 'material-ui/Tabs';

// import GeneralTab from '../components/settings/tabs/GeneralTab';
// import HotkeyTab from '../components/settings/tabs/HotkeyTab';
// import LastFMTab from '../components/settings/tabs/LastFMTab';
// import MiniTab from '../components/settings/tabs/MiniTab';
// import PlaybackTab from '../components/settings/tabs/PlaybackTab';
// import StyleTab from '../components/settings/tabs/StyleTab';
import WindowContainer from '../components/generic/WindowContainer';

export default class LastFmPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      track: {
        artist: undefined,
        title: undefined,
        album: undefined,
      },
      timeBeforeScrobble: undefined,
      lastScrobble: undefined,
    };
  }

  componentDidMount() {
    Emitter.on('lastfm:track-change', this.onTrack);
    Emitter.on('lastfm:update-time-before-scrobble', this.onTimeBeforeScrobble);
    Emitter.on('lastfm:scrobble-event', this.onScrobble);
  }

  componentWillUnmount() {
    Emitter.off('lastfm:track-change', this.onTrack);
    Emitter.off('lastfm:update-time-before-scrobble', this.onTimeBeforeScrobble);
    Emitter.off('lastfm:scrobble-event', this.onScrobble);
  }

  onTrack = (e, track) => {
    this.setState({
      track,
    });
  }

  onTimeBeforeScrobble = (e, time) => {
    this.setState({
      timeBeforeScrobble: this.formatTime(time),
    });
  }

  onScrobble = (e, details) => {
    console.log(details);
    this.setState({
      lastScrobble: new Date(details.date).toLocaleTimeString(),
    });
  }

  formatTime(time) {
    const pad = (num) => {
      let s = num.toString();
      while (s.length < 2) s = `0${s}`;
      return s;
    };

    const seconds = Math.round(time / 1000);
    return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  }

  render() {
    return (
      <WindowContainer title="Last.fm">
        <div className="info-node">
          <span>Artist: </span>
          {this.state.track.artist}
        </div>
        <div className="info-node">
          <span>Track: </span>
          {this.state.track.title}
        </div>
        <div className="info-node">
          <span>Album: </span>
          {this.state.track.album}
        </div>
        <div className="info-node">
          <span>Time before next scrobble: </span>
          {this.state.timeBeforeScrobble}
        </div>
        <div className="info-node">
          <span>Last scrobble: </span>
          {this.state.lastScrobble}
        </div>
      </WindowContainer>
    );
  }
}
