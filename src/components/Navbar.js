import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { NavLink, withRouter } from 'react-router-dom';
import { compose } from 'recompose'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MusicControlPanel from './musicControls';

const styles = {
  root: {
    flexGrow: 1,
    zIndex: 999,
  },
  menuButton: {
    marginLeft: -18,
    marginRight: 10,
  },
};

function Navbar(props) {
  const { classes, history } = props;

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <MusicControlPanel />
          <Typography variant="h6" color="inherit">
            Bruh
          </Typography>
          <Button onClick={() => { history.push('/') }}>Home</Button>
          <Button onClick={() => { history.push('/projects') }}>Project</Button>
          <Button onClick={() => { history.push('/about') }}>About</Button>
        </Toolbar>
      </AppBar>
    </div >
  );
}

Navbar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withRouter,
  withStyles(styles),
)(Navbar);