const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    projectNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    anneeProjet: {
      type: String,
      required: true,
    },
    projectStatus: {
      type: String,
      enum: ["En cours", "livré", "Suspendu", "Terminé"],
      default: "En cours",
    },
    consistance: {
      type: String,
      trim: true,
    },
    statutFoncier: {
      type: String,
      trim: true,
    },
    referenceFonciere: {
      type: String,
      trim: true,
    },

    // Location fields
    region: {
      type: String,
      trim: true,
    },
    prefecture: {
      type: String,
      trim: true,
    },
    Commune: {
      type: String,
      trim: true,
    },
    cercle: {
      type: String,
      trim: true,
    },

    // Coordinates
    latitude: {
      type: String,
      trim: true,
    },
    longitude: {
      type: String,
      trim: true,
    },
    coordonneesX: {
      type: String,
      trim: true,
    },
    coordonneesY: {
      type: String,
      trim: true,
    },

    // Dates
    dateDebutProjet: {
      type: Date,
    },
    dateFinProjet: {
      type: Date,
    },
    dateLivraisonPrevue: {
      type: Date,
    },

    // Client reference
    maitreOuvrage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Additional fields
    Facture: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
      },
    ],
    tempsPasse: {
      type: Number,
      default: 0,
    },
    historiqueArrets: [
      {
        date: Date,
        raison: String,
        duree: Number,
      },
    ],
    archived: {
      type: Boolean,
      default: false,
    },

    // GeoJSON data for map visualization
    geoJsonData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
projectSchema.index({ projectNumber: 1 })
projectSchema.index({ projectStatus: 1 })
projectSchema.index({ region: 1 })
projectSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Project", projectSchema)
