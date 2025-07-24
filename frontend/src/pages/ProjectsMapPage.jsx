import React from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import ProjectsMap from '../components/maps/ProjectsMap'

const ProjectsMapPage = () => {
  return (
    <AdminLayout title="Carte des Projets">
      <ProjectsMap />
    </AdminLayout>
  )
}

export default ProjectsMapPage
