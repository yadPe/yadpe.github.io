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
import Typography from '@material-ui/core/Typography';
import LibraryMusic from '@material-ui/icons/LibraryMusic';
import ReactAplayer from 'react-aplayer';
//import ColorThief from '../color-thief';

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
    nowPlaying: null,
  };

  togglePanel = (side, open) => () => {
    this.setState({
      [side]: open,
    });
  };

  onInit = ap => {
    const { requestColorTheme } = this.props;
    //this.colorThief = new ColorThief();
    this.ap = ap;
    window.audioPlayer = ap;

    // this.setTheme = (index) => {
    //   if (!ap.list.audios[index].theme) {
    //     this.colorThief.getColor(ap.list.audios[index].cover, function (color) {
    //       ap.theme(`rgb(${color[0]}, ${color[1]}, ${color[2]})`, index);
    //     });
    //   }
    // };

    // setTheme(ap.list.index);
    ap.on('listswitch', (data) => {
      console.log(ap.list.audios[data.index].theme);
      requestColorTheme(ap.list.audios[data.index].theme);
      //setTheme(data.index);
      //ap.theme(ap.list.audios[data.index].theme)
    });
  };

  onPlay = (e) => {
    console.log('on play');
    const songName = this.ap.list.audios.filter(song => song.url === e.path[0].src)[0].name;
    //console.log(np);
    this.setState({
      nowPlaying: songName,
    })
    this.np = e.path.src;
  };

  onPause = () => {
    console.log('on pause');
    this.setState({
      nowPlaying: null,
    })
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
        theme: 'rgb(163, 136, 100)'
      },
      {
        name: 'Marigold feat. Guriri',
        artist: 'M2U',
        url: 'https://raw.githubusercontent.com/yadPe/yadpe.github.io/master/src/assets/marigold.mp3',
        cover: 'https://github.com/yadPe/yadpe.github.io/blob/master/src/assets/marigold.jpg?raw=true',
        lrc: '',
        theme: 'rgb(241, 228, 199)'
      },
      {
        name: 'Routing',
        artist: 'Camellia',
        url: 'https://raw.githubusercontent.com/yadPe/yadpe.github.io/master/src/assets/routing.mp3',
        cover: 'https://github.com/yadPe/yadpe.github.io/blob/master/src/assets/routing.jpg?raw=true',
        lrc: '',
        theme: 'rgb(233, 192, 215)'
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
        <Typography>
          {this.state.nowPlaying || null}
        </Typography>

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
