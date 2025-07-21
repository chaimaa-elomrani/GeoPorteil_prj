import React from "react"

const Badge = React.forwardRef(({ 
  className = "", 
  variant = "default", 
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
  
  const variants = {
    default: "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80",
    destructive: "border-transparent bg-red-500 text-gray-50 hover:bg-red-500/80",
    outline: "text-gray-950",
    success: "border-transparent bg-green-500 text-white hover:bg-green-500/80",
    warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
    info: "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
  }
  
  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
