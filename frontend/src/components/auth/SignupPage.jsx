    "use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export default function SignupPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    nom: "",
    prenom: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setFieldErrors({})
    setSuccess("")

    try {
      // Client-side validation
      if (!formData.email.trim()) {
        throw new Error("Email est obligatoire")
      }
      if (!formData.nom.trim()) {
        throw new Error("Nom est obligatoire")
      }
      if (!formData.prenom.trim()) {
        throw new Error("Prénom est obligatoire")
      }

      console.log("Sending signup request with data:", formData)

      // Send signup request to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:9000/api"}/signup-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          phone: formData.phone.trim(),
        }),
      })

      const data = await response.json()
      console.log("Response from server:", data)
      console.log("Specific errors:", data.errors); 

      if (!response.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          console.log("Validation errors details:", data.errors); 
          const errors = {}
          data.errors.forEach(err => {
            if (err.field) {
              errors[err.field] = err.message
            }
          })
          setFieldErrors(errors)
        }
        throw new Error(data.message || "Erreur lors de l'inscription")
      }

      if (data.success) {
        setSuccess("Demande d'inscription envoyée avec succès! Vous recevrez un email de confirmation.")

        // Reset form
        setFormData({
          email: "",
          nom: "",
          prenom: "",
          phone: "",
        })

        // Redirect to pending approval page after delay
        setTimeout(() => {
          navigate("/pending-approval")
        }, 3000)
      } else {
        throw new Error(data.message || "Erreur lors de l'inscription")
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('background_bg.jpg')",
      }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Inscription</h1>
        <p className="text-gray-600">Demandez l'accès à votre compte</p>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

        {/* Success Message */}
        {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Inputs */}
        <div className="flex gap-4">
          <div className="group flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input
            type="text"
            name="nom"
            placeholder="Votre nom"
            value={formData.nom || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 group-hover:border-gray-400 ${
              fieldErrors.nom ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {fieldErrors.nom && <p className="mt-1 text-sm text-red-600">{fieldErrors.nom}</p>}
          </div>
          <div className="group flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
          <input
            type="text"
            name="prenom"
            placeholder="Votre prénom"
            value={formData.prenom || ""}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 group-hover:border-gray-400 ${
              fieldErrors.prenom ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {fieldErrors.prenom && <p className="mt-1 text-sm text-red-600">{fieldErrors.prenom}</p>}
          </div>
        </div>
        {/* Phone Input */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone (optionnel)</label>
          <input
          type="tel"
          name="phone"
          placeholder="06 12 34 56 78 (optionnel)"
          value={formData.phone || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 group-hover:border-gray-400 ${
            fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          />
          {fieldErrors.phone && <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>}
        </div>
        {/* Email Input */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
          <div className="relative">
          <input
            type="email"
            name="email"
            placeholder="exemple@email.com"
            value={formData.email}
            onChange={handleInputChange}

            className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all duration-200 group-hover:border-gray-400 ${
              fieldErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            />
            </svg>
          </div>
          </div>
          {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
            Votre demande sera examinée par notre équipe. Vous recevrez un email de confirmation une fois votre
            compte approuvé.
            </p>
          </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
            </svg>
            Envoi en cours...
          </div>
          ) : (
          "Demander l'accès"
          )}
        </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Vous avez déjà un compte ?{" "}
          <Link
          to="/login"
          className="text-green-600 hover:text-green-700 font-semibold focus:outline-none transition-colors duration-200 hover:underline"
          >
          Se connecter
          </Link>
        </p>
        </div>

        {/* Terms */}
        <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          En demandant l'accès, vous acceptez nos{" "}
          <a href="#" className="text-green-600 hover:underline">
          Conditions d'utilisation
          </a>{" "}
          et notre{" "}
          <a href="#" className="text-green-600 hover:underline">
          Politique de confidentialité
          </a>
        </p>
        </div>
      </div>
      </div>
    </div>
    )
}
