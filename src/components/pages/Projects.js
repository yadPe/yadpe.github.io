import React from 'react';
import Grid from '@material-ui/core/Grid';
import Project from '../Project';
import { projects_db } from '../../projects_db';

const Projects = (props) => {
    return (
        <div>
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ padding: 24}}>

                {projects_db.map(project => (
                    <Grid item xs={12} sm={10} lg={8} xl={7}>
                    <Project title={project.titre} description={project.description} cover={project.cover} link={project.link}/>
                </Grid>
                ))}

                

            </Grid>
        </div>
    )
}

export default Projects;