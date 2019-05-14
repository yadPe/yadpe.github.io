import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Projects from './components/pages/Projects';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      primaryColor: '#37b44e',
    };
  }

  getSongColorTheme = (color) => {
    this.setState({ primaryColor: color });
  }

  render() {
    const { primaryColor } = this.state;

    const theme = createMuiTheme({
      palette: {
        primary: {
          main: primaryColor,
        },
      },
    });
    return (
      <div className="App">
        <MuiThemeProvider theme={theme}>
          <Navbar requestColorTheme={this.getSongColorTheme} />
          <Switch>
            <Route exact path='/' component={Home} />
            <Route path="/about" component={About} />
            <Route path="/projects" component={Projects} />
          </Switch>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;