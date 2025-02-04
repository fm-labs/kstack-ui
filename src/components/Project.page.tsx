import React from 'react'
import { useLoaderData } from 'react-router-dom'
import { Button, Container, Table } from 'react-bootstrap'
import { FaPause, FaPlay, FaStop, FaTrash } from 'react-icons/fa'
import api from '../api.ts'

const ProjectPage = () => {
  const loaderData = useLoaderData() as any // IDockerComposeProject
  const [data, setData] = React.useState(loaderData)

  const handleProjectStartClick = (id: string) => () => {
    console.log('Starting project', id)
    //api.startProject()(id)
  }

  const handleProjectStopClick = (id: string) => () => {
    console.log('Stopping project', id)
    //api.stopProject()(id)
  }

  React.useEffect(() => {
    console.log('ProjectPage mounted')
    const timer = setInterval(() => {
      console.log('Refreshing projects')
      api
        .getProject()(data.key)
        .then((data) => {
          console.log('Project refreshed', data)
          setData(data)
        })
    }, 5000)
    return () => {
      console.log('ProjectPage unmounted')
      clearInterval(timer)
    }
  }, [])

  return (
    <Container>
      <h1>Project {data?.key || 'Untitled'}</h1>
      {/*<ProjectCreateModal />*/}
      <Button size={'sm'} onClick={handleProjectStartClick(data.key)}>
        <FaPlay /> Start
      </Button>
      <Button size={'sm'} onClick={handleProjectStopClick(data.key)}>
        <FaStop /> Stop
      </Button>
      <Button size={'sm'} variant={'danger'}>
        <FaTrash /> Remove
      </Button>
      <hr />
      <textarea style={{ width: '100%', height: '300px' }} defaultValue={data?.data}></textarea>
    </Container>
  )
}

export default ProjectPage
