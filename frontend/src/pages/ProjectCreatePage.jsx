import React from 'react'
import AdminLayout from '../components/AdminLayout'
import ProjectCreate from '../components/ProjectCreate'

const ProjectCreatePage = () => {
  return (
    <AdminLayout title="Créer un Projet">
      <ProjectCreate />
    </AdminLayout>
  )
}

export default ProjectCreatePage
