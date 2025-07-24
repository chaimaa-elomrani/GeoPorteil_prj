import React from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import ProjectsMapWithProject from '../components/maps/ProjectsMapWithProject'

const ProjectMapWithProjectPage = () => {
  return (
    <AdminLayout title="Carte du Projet">
      <ProjectsMapWithProject />
    </AdminLayout>
  )
}

export default ProjectMapWithProjectPage
