import React from 'react';
import Grid from '@material-ui/core/Grid';
import Project from '../Project';
import { projects_db } from '../../projects_db';

const Projects = (props) => {
  const style = {
    background: '#121212'
  }
  return (
    <div style={style}>
      <Grid
        container
        spacing={5}
        justify="center"
        style={{ width: '100%' }}
      >



        <Grid item lg={12} align="center">
          <Project  />
        </Grid>

        {projects_db.map(project => (

          <Grid item lg={5} align="center">
            <Project title={project.titre} description={project.description} cover={project.cover} link={project.link} />
          </Grid>

        ))}



      </Grid>
    </div>
  )
}

export default Projects;