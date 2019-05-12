import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import LibraryMusic from '@material-ui/icons/LibraryMusic';
import ReactAplayer from 'react-aplayer';

const styles = {
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
};

class MusicControlPanel extends React.Component {
  state = {
    top: false,
  };

  togglePanel = (side, open) => () => {
    this.setState({
      [side]: open,
    });
  };

  onInit = ap => {
    window.audioPlayer = ap;
  };

  onPlay = () => {
    console.log('on play');
  };

  onPause = () => {
    console.log('on pause');
  };

  playerSettings = {
    theme: '#F57F17',
    lrcType: 3,
    audio: [
      {
        name: 'artcore JINJA',
        artist: 'An',
        url: 'https://raw.githubusercontent.com/yadPe/yadpe.github.io/master/src/assets/jinja.mp3',
        cover: 'https://github.com/yadPe/yadpe.github.io/blob/master/src/assets/jinja.jpg?raw=true',
        lrc: '',
        theme: '#ebd0c2'
      },
      {
        name: 'Marigold feat. Guriri',
        artist: 'M2U',
        url: 'https://raw.githubusercontent.com/yadPe/yadpe.github.io/master/src/assets/marigold.mp3',
        cover: 'https://github.com/yadPe/yadpe.github.io/blob/master/src/assets/marigold.jpg?raw=true',
        lrc: '',
        theme: '#ebd0c2'
      }
    ]
  };

  render() {

    const fullList = (
      <div className={'fullList'}>
        <ReactAplayer
          {...this.playerSettings}
          onInit={this.onInit}
          onPlay={this.onPlay}
          onPause={this.onPause}
        />
      </div>
    );

    return (
      <div>
        <Button onClick={this.togglePanel('top', true)}><LibraryMusic /></Button>

        <Drawer anchor="top" open={this.state.top} onClose={this.togglePanel('top', false)}>
          <div
            tabIndex={0}
            role="button"
          //onClick={this.togglePanel('top', false)}
          //onKeyDown={this.togglePanel('top', false)}
          >
            {fullList}
          </div>
        </Drawer>
      </div>
    );
  }
}

MusicControlPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default MusicControlPanel;
