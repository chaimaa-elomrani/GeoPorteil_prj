import React from 'react'
import AdminLayout from '../components/layout/AdminLayout'
import SignupRequests from '../components/users/SignupRequests'

const AdminSignupRequestsPage = () => {
  return (
    <AdminLayout title="Demandes d'Inscription">
      <SignupRequests />
    </AdminLayout>
  )
}

export default AdminSignupRequestsPage
