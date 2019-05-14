import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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
  const { classes } = props;

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <MusicControlPanel />
          <Typography variant="h6" color="inherit">
            Bruh
          </Typography>

            <Button>Project</Button>

        </Toolbar>
      </AppBar>

    </div >
  );
}

Navbar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Navbar);