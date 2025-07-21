import React from 'react'
import AdminLayout from '../components/AdminLayout'
import ProjectEdit from '../components/ProjectEdit'

const ProjectEditPage = () => {
  return (
    <AdminLayout title="Modifier le Projet">
      <ProjectEdit />
    </AdminLayout>
  )
}

export default ProjectEditPage
