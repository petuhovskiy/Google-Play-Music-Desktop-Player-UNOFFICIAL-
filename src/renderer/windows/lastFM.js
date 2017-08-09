import { remote } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import LastFmPage from '../ui/pages/LastFmPage';

injectTapEventPlugin();

ReactDOM.render(<LastFmPage />, document.querySelector('#last-fm-window'));
remote.getCurrentWindow().show();
