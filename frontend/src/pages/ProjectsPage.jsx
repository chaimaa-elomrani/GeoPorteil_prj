import React from 'react'
import AdminLayout from '../components/AdminLayout'
import ProjectsDashboard from '../components/ProjectsDashboard'

const ProjectsPage = () => {
  return (
    <AdminLayout title="Gestion des Projets">
      <ProjectsDashboard />
    </AdminLayout>
  )
}

export default ProjectsPage
