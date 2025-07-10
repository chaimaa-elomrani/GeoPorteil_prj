// Email templates for approval and rejection

export const getApprovalEmailTemplate = (email, password, additionalInfo = "") => {
  return {
    subject: "🎉 Votre demande d'accès a été approuvée - Bienvenue !",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Demande Approuvée !</h1>
            <p>Bienvenue dans notre plateforme</p>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Nous avons le plaisir de vous informer que votre demande d'accès à notre plateforme a été <strong>approuvée</strong> !</p>
            
            ${additionalInfo ? `<p><em>${additionalInfo}</em></p>` : ""}
            
            <div class="credentials">
              <h3>🔐 Vos identifiants de connexion</h3>
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Mot de passe temporaire :</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important :</strong></p>
              <ul>
                <li>Ce mot de passe est temporaire et doit être changé lors de votre première connexion</li>
                <li>Gardez ces informations confidentielles</li>
                <li>En cas de problème, contactez notre support</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" class="button">
                Se connecter maintenant
              </a>
            </p>
            
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>L'équipe GeoManager</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Demande Approuvée !
      
      Bonjour,
      
      Nous avons le plaisir de vous informer que votre demande d'accès à notre plateforme a été approuvée !
      
      ${additionalInfo ? `${additionalInfo}\n\n` : ""}
      
      Vos identifiants de connexion :
      Email : ${email}
      Mot de passe temporaire : ${password}
      
      IMPORTANT :
      - Ce mot de passe est temporaire et doit être changé lors de votre première connexion
      - Gardez ces informations confidentielles
      - En cas de problème, contactez notre support
      
      Connectez-vous : ${process.env.FRONTEND_URL || "http://localhost:3000"}/login
      
      Cordialement,
      L'équipe GeoManager
    `,
  }
}

export const getRejectionEmailTemplate = (email, reason) => {
  return {
    subject: "❌ Votre demande d'accès - Mise à jour",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reason { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .info { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Demande Non Approuvée</h1>
            <p>Mise à jour de votre demande d'accès</p>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Nous vous remercions pour votre intérêt pour notre plateforme. Malheureusement, nous ne pouvons pas approuver votre demande d'accès à ce moment.</p>
            
            <div class="reason">
              <h3>📋 Raison du rejet</h3>
              <p>${reason}</p>
            </div>
            
            <div class="info">
              <p><strong>💡 Que faire maintenant ?</strong></p>
              <ul>
                <li>Vérifiez que vos informations sont complètes et correctes</li>
                <li>Assurez-vous de répondre à tous les critères d'éligibilité</li>
                <li>Vous pouvez soumettre une nouvelle demande après correction</li>
                <li>Contactez notre support si vous avez des questions</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/signup" class="button">
                Soumettre une nouvelle demande
              </a>
            </p>
            
            <p>Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@geomanager.com">support@geomanager.com</a>.</p>
            
            <p>Cordialement,<br>L'équipe GeoManager</p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>Pour toute question, contactez : support@geomanager.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Demande Non Approuvée
      
      Bonjour,
      
      Nous vous remercions pour votre intérêt pour notre plateforme. Malheureusement, nous ne pouvons pas approuver votre demande d'accès à ce moment.
      
      Raison du rejet :
      ${reason}
      
      Que faire maintenant ?
      - Vérifiez que vos informations sont complètes et correctes
      - Assurez-vous de répondre à tous les critères d'éligibilité
      - Vous pouvez soumettre une nouvelle demande après correction
      - Contactez notre support si vous avez des questions
      
      Soumettre une nouvelle demande : ${process.env.FRONTEND_URL || "http://localhost:3000"}/signup
      
      Pour toute question : support@geomanager.com
      
      Cordialement,
      L'équipe GeoManager
    `,
  }
}
