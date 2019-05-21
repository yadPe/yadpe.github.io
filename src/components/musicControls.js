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

const reqSongs = require.context('../assets', true, /\.mp3$/);
const reqCovers = require.context('../assets', true, /\.jpg$/);

const style = {

    position: 'relative',
    top: 100,


};

class MusicControlPanel extends React.Component {
  state = {
    top: false,
    nowPlaying: null,
    y: -1000,
  };

  togglePanel = (side, open) => () => {
    this.setState({
      [side]: open,
      y: open ? 0 : -1000,
    });
  };

  onInit = ap => {
    const { requestColorTheme } = this.props;
    //this.colorThief = new ColorThief();
    this.ap = ap;
    this.ap.options.container.parentNode.parentNode.parentNode.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    this.ap.options.container.parentNode.parentNode.parentNode.style.boxShadow = 'none';
    window.audioPlayer = ap;

    //console.log(reqSongs('./jinja.mp3', true))

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
    //console.log(e.path[0].src);
    //const songName = this.ap.list.audios.filter(song => song.url === `http://localhost:3000${e.path[0].src}`)[0].name || 'unknown';
    const songName = 'unknown';

    this.setState({
      nowPlaying: songName,
    })
    //this.np = e.path.src;
    window.playing = true;
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
        url: reqSongs('./jinja.mp3', true),
        cover: reqCovers('./jinja.jpg', true),
        lrc: '',
        theme: 'rgb(163, 136, 100)'
      },
      {
        name: 'Marigold feat. Guriri',
        artist: 'M2U',
        url: reqSongs('./marigold.mp3', true),
        cover: reqCovers('./marigold.jpg', true),
        lrc: '',
        theme: 'rgb(241, 228, 199)'
      },
      {
        name: 'Routing',
        artist: 'Camellia',
        url: reqSongs('./routing.mp3', true),
        cover: reqCovers('./routing.jpg', true),
        lrc: '',
        theme: 'rgb(233, 192, 215)'
      },
      {
        name: 'Before My Body Is Dry (tomatomerde remix)',
        artist: 'tomatomerde',
        url: reqSongs('./Before_my_body_is_dry_(tomatomerde remix).mp3', true),
        cover: reqCovers('./Before_my_body_is_dry_(tomatomerde remix).jpg', true),
        lrc: '',
        theme: 'rgb(233, 192, 215)'
      },
      {
        name: 'illanai-assorted',
        artist: 't+pazolite',
        url: reqSongs('./illanai-assorted.mp3', true),
        cover: reqCovers('./illanai-assorted.jpg', true),
        lrc: '',
        theme: 'rgb(233, 192, 215)'
      },
      {
        name: 'Alexandrite',
        artist: 'onoken',
        url: reqSongs('./alexandrite.mp3', true),
        cover: reqCovers('./alexandrite.jpg', true),
        lrc: '',
        theme: 'rgb(233, 192, 215)'
      },
      {
        name: "dreamin' feat.Ryu [EXH]",
        artist: 'Mayumi Morinaga',
        url: reqSongs('./dreamin_feat.Ryu_[EXH].mp3', true),
        cover: reqCovers('./dreamin_feat.Ryu_[EXH].jpg', true),
        lrc: '',
        theme: 'rgb(233, 192, 215)'
      },
      {
        name: "World Fragments III",
        artist: 'Xi',
        url: reqSongs('./world_fragments_III.mp3', true),
        cover: reqCovers('./world_fragments_III.jpg', true),
        lrc: '',
        theme: 'rgb(233, 192, 215)'
      }
    ]
  };

  render() {

    //const { classes } = this.props;

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
        <Button onClick={this.togglePanel('top', true)}>
          <LibraryMusic />
          <Typography>
            {this.state.nowPlaying || null}
          </Typography>
        </Button>

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
