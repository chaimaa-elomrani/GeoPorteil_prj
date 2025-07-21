import React from 'react'
import AdminLayout from '../components/AdminLayout'
import UserManagement from '../components/UserManagement'

const AdminUsersPage = () => {
  return (
    <AdminLayout title="Gestion des Utilisateurs">
      <UserManagement />
    </AdminLayout>
  )
}

export default AdminUsersPage
