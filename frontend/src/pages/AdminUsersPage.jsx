import React from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import UserManagement from '../components/users/UserManagement'

const AdminUsersPage = () => {
  return (
    <AdminLayout title="Gestion des Utilisateurs">
      <UserManagement />
    </AdminLayout>
  )
}

export default AdminUsersPage
