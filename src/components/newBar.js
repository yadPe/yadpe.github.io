import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import { withRouter } from 'react-router-dom';
import MusicControlPanel from './musicControls';
import Slide from '@material-ui/core/Slide';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.node.isRequired,
};

export default withRouter(function HideAppBar(props) {
    const { history, requestColorTheme } = props; 
  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
        <AppBar>
        <Toolbar variant="dense">
          
          <Typography variant="h6" color="inherit">
            Bruh
          </Typography>
          <Button onClick={() => { history.push('/') }}>Home</Button>
          <Button onClick={() => { history.push('/projects') }}>Project</Button>
          <Button onClick={() => { history.push('/audiovisualizer') }}>About</Button>
          <MusicControlPanel requestColorTheme={requestColorTheme}/>
        </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
    </React.Fragment>
  );
})
