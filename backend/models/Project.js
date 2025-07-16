import mongoose from 'mongoose';

// Schéma Projet
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
  statutProjet: String,
  suiviEnTempsReel: { type: mongoose.Schema.Types.ObjectId, ref: 'SuiviTempsReel' },
  rapportsAnalyses: { type: mongoose.Schema.Types.ObjectId, ref: 'RapportAnalyse' },
  brigades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brigade' }]
});
export default mongoose.model('Projet', projetSchema); // Correction : Export du modèle Projet













