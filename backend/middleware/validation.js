const { body, validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Erreurs de validation",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    })
  }
  next()
}

const emailValidation = [
  body("email")
    .isEmail()
    .withMessage("Format d'email invalide")
    .normalizeEmail()
    .isLength({ min: 5, max: 254 })
    .withMessage("L'email doit contenir entre 5 et 254 caractères")
    .custom(async (email) => {
      // Additional custom validation if needed
      const blockedDomains = ["tempmail.com", "10minutemail.com"]
      const domain = email.split("@")[1]
      if (blockedDomains.includes(domain)) {
        throw new Error("Ce domaine email n'est pas autorisé")
      }
      return true
    }),
]

module.exports = {
  handleValidationErrors,
  emailValidation,
}
