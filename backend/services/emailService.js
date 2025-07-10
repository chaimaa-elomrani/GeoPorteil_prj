const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
    console.log("🔧 Initializing Email Service...");
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_PORT:", process.env.SMTP_PORT);
    
    // Fix: use createTransport (not createTransporter)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add these options for less secure apps
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("❌ SMTP connection failed:", error);
      throw error;
    }
  }

  async sendUserConfirmationEmail(userEmail, nom, prenom, phone) {
    const mailOptions = {
      from: `"${process.env.APP_NAME || "Mon Application"}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Confirmation de votre demande d'inscription",
      html: this.getUserConfirmationTemplate(userEmail, nom, prenom, phone),
      text: this.getUserConfirmationTextTemplate(userEmail, nom, prenom, phone),
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log("✅ User confirmation email sent:", info.messageId)
      return info
    } catch (error) {
      console.error("❌ Error sending user confirmation email:", error)
      throw error
    }
  }

  async sendAdminNotificationEmail(userEmail, nom, prenom, phone, requestId) {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    console.log("🔍 Admin email debug:");
    console.log("- ADMIN_EMAIL from env:", adminEmail);
    console.log("- User email:", userEmail);
    console.log("- User name:", nom, prenom);
    console.log("- User phone:", phone);
    console.log("- Request ID:", requestId);
    
    if (!adminEmail) {
      console.warn("⚠️ ADMIN_EMAIL not configured, skipping admin notification");
      return;
    }

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Geoporteil"}" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🔔 Nouvelle demande d'inscription - ${prenom} ${nom}`,
      html: this.getAdminNotificationTemplate(userEmail, nom, prenom, phone, requestId),
      text: this.getAdminNotificationTextTemplate(userEmail, nom, prenom, phone, requestId),
    };

    console.log("📧 Sending admin email to:", adminEmail);

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Admin notification email sent successfully!");
      console.log("- Message ID:", info.messageId);
      console.log("- To:", adminEmail);
      return info;
    } catch (error) {
      console.error("❌ Error sending admin notification email:");
      console.error("- Error:", error.message);
      console.error("- Admin email:", adminEmail);
      throw error;
    }
  }

  // Method to send both emails at once
  async sendRegistrationEmails(userEmail, nom, prenom, phone, requestId) {
    const results = {
      userEmail: null,
      adminEmail: null,
      errors: []
    };

    try {
      // Send user confirmation email
      console.log("📧 Sending user confirmation email...");
      results.userEmail = await this.sendUserConfirmationEmail(userEmail, nom, prenom, phone);
    } catch (error) {
      console.error("❌ Failed to send user confirmation email:", error);
      results.errors.push({ type: 'user', error: error.message });
    }

    try {
      // Send admin notification email
      console.log("📧 Sending admin notification email...");
      results.adminEmail = await this.sendAdminNotificationEmail(userEmail, nom, prenom, phone, requestId);
    } catch (error) {
      console.error("❌ Failed to send admin notification email:", error);
      results.errors.push({ type: 'admin', error: error.message });
    }

    return results;
  }

  getUserConfirmationTemplate(userEmail, nom, prenom, phone) {
    const fullName = `${prenom} ${nom}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de demande</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info-box { background-color: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Demande reçue !</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${fullName}</strong>,</p>
            <p>Nous avons bien reçu votre demande d'inscription avec les informations suivantes :</p>
            
            <div class="info-box">
              <strong>Vos informations :</strong><br>
              Nom : ${nom}<br>
              Prénom : ${prenom}<br>
              Email : ${userEmail}<br>
              Téléphone : ${phone || 'Non renseigné'}
            </div>
            
            <p>Notre équipe va examiner votre demande et vous reviendra dans les <strong>24 à 48 heures</strong>.</p>
            <p>Vous recevrez un email de confirmation une fois votre compte activé.</p>
            <p>Merci pour votre patience !</p>
            <p>Cordialement,<br>L'équipe ${process.env.APP_NAME || "Mon Application"}</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  getUserConfirmationTextTemplate(userEmail, nom, prenom, phone) {
    const fullName = `${prenom} ${nom}`;
    
    return `
Bonjour ${fullName},

Nous avons bien reçu votre demande d'inscription avec les informations suivantes :

Vos informations :
- Nom : ${nom}
- Prénom : ${prenom}
- Email : ${userEmail}
- Téléphone : ${phone || 'Non renseigné'}

Notre équipe va examiner votre demande et vous reviendra dans les 24 à 48 heures.

Vous recevrez un email de confirmation une fois votre compte activé.

Merci pour votre patience !

Cordialement,
L'équipe ${process.env.APP_NAME || "Mon Application"}

---
Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    `
  }

  getAdminNotificationTemplate(userEmail, nom, prenom, phone, requestId) {
    const dashboardUrl = process.env.DASHBOARD_URL || "http://localhost:3000/admin"
    const fullName = `${prenom} ${nom}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nouvelle demande d'inscription</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .info-box { background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
          .user-info { background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouvelle demande d'inscription</h1>
          </div>
          <div class="content">
            <p>Bonjour Admin,</p>
            <p>Vous avez reçu une nouvelle demande d'inscription de <strong>${fullName}</strong> !</p>
            
            <div class="user-info">
              <strong>Informations du demandeur :</strong><br>
              Nom : ${nom}<br>
              Prénom : ${prenom}<br>
              Email : ${userEmail}<br>
              Téléphone : ${phone || 'Non renseigné'}
            </div>
            
            <div class="info-box">
              <strong>Détails de la demande :</strong><br>
              ID de la demande : ${requestId}<br>
              Date : ${new Date().toLocaleString("fr-FR")}<br>
              Statut : En attente de validation
            </div>
            
            <p>Veuillez consulter votre tableau de bord pour examiner cette demande :</p>
            <a href="${dashboardUrl}" class="button">Accéder au tableau de bord</a>
            
            <p><strong>Actions à effectuer :</strong></p>
            <ul>
              <li>Vérifier les informations du demandeur</li>
              <li>Approuver ou rejeter la demande</li>
              <li>Envoyer la notification de décision</li>
            </ul>
            
            <p>Cordialement,<br>Système de notification</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  getAdminNotificationTextTemplate(userEmail, nom, prenom, phone, requestId) {
    const dashboardUrl = process.env.DASHBOARD_URL || "http://localhost:3000/admin"
    const fullName = `${prenom} ${nom}`;

    return `
Bonjour Admin,

Vous avez reçu une nouvelle demande d'inscription de ${fullName} !

Informations du demandeur :
- Nom : ${nom}
- Prénom : ${prenom}
- Email : ${userEmail}
- Téléphone : ${phone || 'Non renseigné'}

Détails de la demande :
- ID de la demande : ${requestId}
- Date : ${new Date().toLocaleString("fr-FR")}
- Statut : En attente de validation

Veuillez consulter votre tableau de bord pour examiner cette demande :
${dashboardUrl}

Actions à effectuer :
- Vérifier les informations du demandeur
- Approuver ou rejeter la demande
- Envoyer la notification de décision

Cordialement,
Système de notification
    `
  }
}

module.exports = new EmailService()
