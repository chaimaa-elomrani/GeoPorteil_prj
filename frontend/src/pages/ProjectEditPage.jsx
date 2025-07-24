import React from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import ProjectEdit from '../components/projects/ProjectEdit'

const ProjectEditPage = () => {
  return (
    <AdminLayout title="Modifier le Projet">
      <ProjectEdit />
    </AdminLayout>
  )
}

export default ProjectEditPage
