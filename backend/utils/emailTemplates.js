const getApprovalEmailTemplate = (email, password, additionalInfo = "") => {
  const appName = process.env.APP_NAME || "Geoporteil";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  
  return {
    subject: `🎉 Votre compte ${appName} a été approuvé !`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte approuvé</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials-box { background-color: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; border-radius: 4px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background-color: #f0f0f0; border-radius: 0 0 8px 8px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Félicitations !</h1>
            <p>Votre compte a été approuvé</p>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Excellente nouvelle ! Votre demande d'inscription à <strong>${appName}</strong> a été approuvée.</p>
            
            <div class="credentials-box">
              <h3>🔑 Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Mot de passe :</strong> ${password}</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important :</strong> Pour votre sécurité, nous vous recommandons fortement de changer votre mot de passe lors de votre première connexion.
            </div>
            
            ${additionalInfo ? `<div style="margin: 15px 0;"><p><strong>Informations supplémentaires :</strong></p><p>${additionalInfo}</p></div>` : ''}
            
            <p>Vous pouvez maintenant vous connecter à votre compte :</p>
            <a href="${frontendUrl}/login" class="button">Se connecter maintenant</a>
            
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            <p>Bienvenue dans ${appName} !</p>
            
            <p>Cordialement,<br>L'équipe ${appName}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            <p>© ${new Date().getFullYear()} ${appName}. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Félicitations !

Votre demande d'inscription à ${appName} a été approuvée.

Vos identifiants de connexion :
- Email : ${email}
- Mot de passe : ${password}

IMPORTANT : Pour votre sécurité, nous vous recommandons fortement de changer votre mot de passe lors de votre première connexion.

${additionalInfo ? `Informations supplémentaires : ${additionalInfo}` : ''}

Vous pouvez vous connecter à : ${frontendUrl}/login

Bienvenue dans ${appName} !

Cordialement,
L'équipe ${appName}

---
Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
© ${new Date().getFullYear()} ${appName}. Tous droits réservés.
    `
  };
};

const getRejectionEmailTemplate = (email, reason) => {
  const appName = process.env.APP_NAME || "Geoporteil";
  
  return {
    subject: `Mise à jour de votre demande d'inscription - ${appName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Demande d'inscription</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .reason-box { background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 15px 0; border-radius: 4px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background-color: #f0f0f0; border-radius: 0 0 8px 8px; }
          .contact-info { background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Mise à jour de votre demande</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Nous vous remercions pour votre intérêt pour <strong>${appName}</strong>.</p>
            <p>Après examen de votre demande d'inscription, nous ne pouvons malheureusement pas l'approuver pour le moment.</p>
            
            <div class="reason-box">
              <h3>📋 Motif :</h3>
              <p>${reason}</p>
            </div>
            
            <div class="contact-info">
              <h3>💬 Besoin d'aide ?</h3>
              <p>Si vous avez des questions concernant cette décision ou si vous souhaitez obtenir plus d'informations, n'hésitez pas à nous contacter.</p>
              <p>Nous restons à votre disposition pour vous accompagner.</p>
            </div>
            
            <p>Nous vous remercions pour votre compréhension.</p>
            <p>Cordialement,<br>L'équipe ${appName}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            <p>© ${new Date().getFullYear()} ${appName}. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Mise à jour de votre demande d'inscription - ${appName}

Bonjour,

Nous vous remercions pour votre intérêt pour ${appName}.

Après examen de votre demande d'inscription, nous ne pouvons malheureusement pas l'approuver pour le moment.

Motif : ${reason}

Si vous avez des questions concernant cette décision ou si vous souhaitez obtenir plus d'informations, n'hésitez pas à nous contacter.

Nous vous remercions pour votre compréhension.

Cordialement,
L'équipe ${appName}

---
Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
© ${new Date().getFullYear()} ${appName}. Tous droits réservés.
    `
  };
};

module.exports = {
  getApprovalEmailTemplate,
  getRejectionEmailTemplate
};
