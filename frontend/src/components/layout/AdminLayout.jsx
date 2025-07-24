"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
  const { user } = useAuth()
  const [adminUser, setAdminUser] = useState({
    name: user?.nom && user?.prenom ? `${user.prenom} ${user.nom}` : user?.email || "Admin User",
    email: user?.email || "admin@example.com",
    role: user?.role || "Administrateur",
    avatar: user?.nom ? user.nom.charAt(0).toUpperCase() : "A",
  })

  useEffect(() => {
    if (user) {
      setAdminUser({
        name: user.nom && user.prenom ? `${user.prenom} ${user.nom}` : user.email,
        email: user.email,
        role: user.role || "Administrateur",
        avatar: user.nom ? user.nom.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "A",
      })
    }
  }, [user])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={adminUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} user={adminUser} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
