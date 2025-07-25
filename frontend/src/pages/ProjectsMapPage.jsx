import React from 'react'
import AdminLayout from '../components/AdminLayout'
import ProjectsMap from '../components/ProjectsMap'

const ProjectsMapPage = () => {
  return (
    <AdminLayout title="Carte des Projets">
      <ProjectsMap />
    </AdminLayout>
  )
}

export default ProjectsMapPage
