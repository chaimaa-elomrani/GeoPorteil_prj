import React from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import ProjectsDashboard from '../components/projects/ProjectsDashboard'

const ProjectsPage = () => {
  return (
    <AdminLayout title="Gestion des Projets">
      <ProjectsDashboard />
    </AdminLayout>
  )
}

export default ProjectsPage
