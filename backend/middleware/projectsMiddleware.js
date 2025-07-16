import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import rareLimit from 'express-rate-limit'; 
import helmet from 'helmet';
import {body, validationResult , query} from 'express-validator';

// shéma de projet

const projetSchema = new mongoose.Schema({
    numeroProjet: String,
    anneeProjet: Number,
    maitreOuvrage: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    statutFoncier: String,
    referenceFonciere: String,
    consistance: String,
    zoneLambert: String,
    coordonneesX: Number,
    coordonneesY: Number,
    region: String,
    prefecture: String,
    cercleCommune: String,
    prestations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prestation' }],
    dateLivraisonPrevue: Date,
    delaiProjet: Date,
    paiements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Paiement' }],
    statutProjet: { type: String, enum: ['EN_COURS', 'TERMINE', 'SUSPENDU', 'ARCHIVE'], default: 'EN_COURS'},
    suiviEnTempsReel: { type: mongoose.Schema.Types.ObjectId, ref: 'SuiviTempsReel' },
    rapportsAnalyses: { type: mongoose.Schema.Types.ObjectId, ref: 'RapportAnalyse' },
    brigades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brigade' }], 
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    externalApiData: { source: String, lastSync: Date, data: mongoose.Schema.Types.Mixed}
});

// index pour ameliorer les perfomances de recherche
projetSchema.index({ numeroProjet: 1, anneeProjet: 1}); 
projetSchema.index({ region: 1 , prefecture: 1});
projetSchema.index({ statutProjet: 1, isArchived: 1});

const Projet = mongoose.model('Projet', projetSchema);

// Rate limiting pour les API externes 
const externalApiLimiter = rateLimit({
    windowMs: 15 * 60* 1000, //15 minutes 
    max:100, //limite de 100 requêtes par IP par fenêtre de temps
    message: 'Trop de requêtes vers lAPI externe reessayer plus tard'
}); 

// Middleware d'authentification 

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeadersplit('')[1]; 
}
