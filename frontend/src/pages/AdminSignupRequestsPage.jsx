import React from 'react'
import AdminLayout from '../components/AdminLayout'
import SignupRequests from '../components/SignupRequests'

const AdminSignupRequestsPage = () => {
  return (
    <AdminLayout title="Demandes d'Inscription">
      <SignupRequests />
    </AdminLayout>
  )
}

export default AdminSignupRequestsPage
