const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
   this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",  // Fixed
      port: process.env.SMTP_PORT || 587,
      service: 'gmail',
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendUserConfirmationEmail(userEmail) {
    const mailOptions = {
      from: `"${process.env.APP_NAME || "Mon Application"}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Confirmation de votre demande d'inscription",
      html: this.getUserConfirmationTemplate(userEmail),
      text: this.getUserConfirmationTextTemplate(userEmail),
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

  async sendAdminNotificationEmail(userEmail, requestId) {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    console.log("🔍 Admin email debug:");
    console.log("- ADMIN_EMAIL from env:", adminEmail);
    console.log("- User email:", userEmail);
    console.log("- Request ID:", requestId);
    
    if (!adminEmail) {
      console.warn("⚠️ ADMIN_EMAIL not configured, skipping admin notification");
      return;
    }

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Geoporteil"}" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: "🔔 Nouvelle demande d'inscription - Geoporteil",
      html: this.getAdminNotificationTemplate(userEmail, requestId),
      text: this.getAdminNotificationTextTemplate(userEmail, requestId),
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

  getUserConfirmationTemplate(userEmail) {
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
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Demande reçue !</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Nous avons bien reçu votre demande d'inscription avec l'adresse email : <strong>${userEmail}</strong></p>
            <p>Notre équipe va examiner votre demande et vous reviendra dans les <strong>24 à 48 heures</strong>.</p>
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

  getUserConfirmationTextTemplate(userEmail) {
    return `
Bonjour,

Nous avons bien reçu votre demande d'inscription avec l'adresse email : ${userEmail}

Notre équipe va examiner votre demande et vous reviendra dans les 24 à 48 heures.

Merci pour votre patience !

Cordialement,
L'équipe ${process.env.APP_NAME || "Mon Application"}

---
Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    `
  }

  getAdminNotificationTemplate(userEmail, requestId) {
    const dashboardUrl = process.env.DASHBOARD_URL || "http://localhost:3000/admin"

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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouvelle demande d'inscription</h1>
          </div>
          <div class="content">
            <p>Bonjour Admin,</p>
            <p>Vous avez reçu une nouvelle demande d'inscription !</p>
            
            <div class="info-box">
              <strong>Détails de la demande :</strong><br>
              Email : ${userEmail}<br>
              ID de la demande : ${requestId}<br>
              Date : ${new Date().toLocaleString("fr-FR")}
            </div>
            
            <p>Veuillez consulter votre tableau de bord pour examiner cette demande :</p>
            <a href="${dashboardUrl}" class="button">Accéder au tableau de bord</a>
            
            <p>Cordialement,<br>Système de notification</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  getAdminNotificationTextTemplate(userEmail, requestId) {
    const dashboardUrl = process.env.DASHBOARD_URL || "http://localhost:3000/admin"

    return `
Bonjour Admin,

Vous avez reçu une nouvelle demande d'inscription !

Détails de la demande :
- Email : ${userEmail}
- ID de la demande : ${requestId}
- Date : ${new Date().toLocaleString("fr-FR")}

Veuillez consulter votre tableau de bord pour examiner cette demande :
${dashboardUrl}

Cordialement,
Système de notification
    `
  }
}

module.exports = new EmailService()
