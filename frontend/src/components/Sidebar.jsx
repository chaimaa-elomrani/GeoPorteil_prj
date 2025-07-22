"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Users, UserPlus, FolderOpen, Shield, Menu, ChevronDown, ChevronRight } from "lucide-react"

export default function Sidebar({ user }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    projects: false,
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const menuItems = [
    {
      id: "dashboard",
      label: "Accueil",
      icon: Home,
      path: "/admin-dashboard",
      single: true,
    },
    {
      id: "users",
      label: "Gestion utilisateurs",
      icon: Users,
      path: "/admin/users",
      single: true,
    },
    {
      id: "requests",
      label: "Demandes d'inscription",
      icon: UserPlus,
      path: "/admin/signup-requests",
      single: true,
    },
    {
      id: "projects",
      label: "Projets",
      icon: FolderOpen,
      expandable: true,
      items: [
        {
          title: "Tous les projets",
          path: "/projects",
        },
        {
          title: "Carte des projets",
          path: "/projects/map",
        },
        {
          title: "Importer GeoJSON",
          path: "/projects/import",
        },
        {
          title: "Visualiseur GeoJSON",
          path: "/geojson-viewer",
        },
        {
          title: "Archives",
          path: "/archive",
        },
      ],
    },
    {
      id: "security",
      label: "Sécurité",
      icon: Shield,
      path: "/security-demo",
      single: true,
    },
  ]

  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-[#354939] text-white flex flex-col transition-all duration-300 shadow-xl min-h-screen`}
    >
      {/* Header */}
      <div className="p-6 border-b border-[#6F9377]">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold">GeoManager</h2>
              <p className="text-green-200 text-sm">Admin Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-[#6F9377] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.single ? (
                <Link
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive(item.path)
                      ? "bg-[#6F9377] text-white shadow-lg"
                      : "text-green-100 hover:bg-[#6F9377] hover:text-white"
                  }`}
                  title={collapsed ? item.label : ""}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      item.items?.some((subItem) => isActive(subItem.path))
                        ? "bg-[#6F9377] text-white"
                        : "text-green-100 hover:bg-[#6F9377] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span className="font-medium">{item.label}</span>}
                    </div>
                    {!collapsed &&
                      (expandedSections[item.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      ))}
                  </button>

                  {expandedSections[item.id] && !collapsed && (
                    <ul className="mt-2 ml-8 space-y-1">
                      {item.items?.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                              isActive(subItem.path)
                                ? "bg-[#6F9377] text-white font-medium"
                                : "text-green-200 hover:bg-[#6F9377] hover:text-white"
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      {!collapsed && user && (
        <div className="p-4 border-t border-[#6F9377]">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#354939]">
            <div className="w-10 h-10 bg-[#6F9377] rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name || user.email}</p>
              <p className="text-xs text-green-200 truncate">{user.role || "Administrateur"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
