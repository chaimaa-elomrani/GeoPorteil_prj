const mongoose = require("mongoose")

// Feature Properties Schema
const FeaturePropertiesSchema = new mongoose.Schema(
  {
    Batiment_i: { type: String, required: true },
    Numero_Fi: { type: String, required: true },
    Date_Enqu: { type: String, required: true },
    Enqueteur: { type: String, required: true },
    Ancienne_: { type: String },
    "Secteur/Q": { type: String, required: true },
    Adresse: { type: String, required: true },
    Occupatio: { type: String },
    Statut_Oc: { type: String },
    Statut_Sc: { type: String, default: null },
    Proprieta: { type: String },
    Foncier: { type: String },
    Foncier_A: { type: String, default: null },
    Superfici: { type: Number, required: true },
    Type_Usag: { type: String, required: true },
    Type_Us_1: { type: String, default: null },
    Type_Equi: { type: String, default: null },
    Soussoll: { type: String },
    Nombre_Ni: { type: String },
    Nombre_Lo: { type: String, default: null },
    Nombre_Me: { type: Number },
    Nombre_Re: { type: Number, required: true },
    Nombre__1: { type: Number },
    Nombre_Lu: { type: Number },
    Conformit: { type: String, default: null },
    Conform_1: { type: String, default: null },
    Nombre_Ba: { type: Number },
    Accessibl: { type: String },
    Motif_Acc: { type: String, default: null },
    Typologie: { type: String, required: true },
    Typolog_1: { type: String, default: null },
    Monument_: { type: String },
    Valeur_Pa: { type: String },
    Age_Batim: { type: String, default: null },
    Classific: { type: String, required: true },
    Risque: { type: String, required: true },
    Risque_Au: { type: String, default: null },
    Fiche_Bat: { type: String, required: true },
    Photo: { type: String },
    Field2: { type: String, default: null },
  },
  { _id: false },
)

// Geometry Schema
const GeometrySchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["Polygon", "Point", "LineString"] },
    coordinates: { type: [[[Number]]], required: true },
  },
  { _id: false },
)

// GeoJSON Feature Schema
const GeoJSONFeatureSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, default: "Feature" },
    properties: { type: FeaturePropertiesSchema, required: true },
    geometry: { type: GeometrySchema, required: true },
  },
  { _id: false },
)

// Statistics Sub-schemas
const StatisticItemSchema = new mongoose.Schema(
  {
    count: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { _id: false },
)

const AccessibilitySchema = new mongoose.Schema(
  {
    accessible: { type: Number, required: true },
    notAccessible: { type: Number, required: true },
    accessibilityRate: { type: Number, required: true },
  },
  { _id: false },
)

const DateRangeSchema = new mongoose.Schema(
  {
    earliest: { type: String, required: true },
    latest: { type: String, required: true },
  },
  { _id: false },
)

const BoundingBoxSchema = new mongoose.Schema(
  {
    minLat: { type: Number, required: true },
    maxLat: { type: Number, required: true },
    minLng: { type: Number, required: true },
    maxLng: { type: Number, required: true },
  },
  { _id: false },
)

const DataQualitySchema = new mongoose.Schema(
  {
    completeRecords: { type: Number, required: true },
    incompleteRecords: { type: Number, required: true },
    completenessRate: { type: Number, required: true },
  },
  { _id: false },
)

// Project Statistics Schema
const ProjectStatisticsSchema = new mongoose.Schema(
  {
    totalBuildings: { type: Number, required: true },
    totalResidents: { type: Number, required: true },
    averageResidentsPerBuilding: { type: Number, required: true },
    totalSurface: { type: Number, required: true },
    averageSurfacePerBuilding: { type: Number, required: true },
    riskClassification: { type: Map, of: StatisticItemSchema },
    buildingTypes: { type: Map, of: StatisticItemSchema },
    usageTypes: { type: Map, of: StatisticItemSchema },
    occupationStatus: { type: Map, of: StatisticItemSchema },
    propertyOwnership: { type: Map, of: StatisticItemSchema },
    accessibility: { type: AccessibilitySchema, required: true },
    floorDistribution: { type: Map, of: StatisticItemSchema },
    enqueteurs: { type: Map, of: StatisticItemSchema },
    dateRange: { type: DateRangeSchema, required: true },
  },
  { _id: false },
)

// Project Info Schema
const ProjectInfoSchema = new mongoose.Schema(
  {
    projectNumber: { type: String, required: true, unique: true },
    anneeProjet: { type: Number, required: true },
    region: { type: String, required: true },
    prefecture: { type: String, required: true },
    secteur: { type: String, required: true },
    dateCreation: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "completed", "suspended", "cancelled", "accepté"],
      default: "active",
    },
  },
  { _id: false },
)

// GeoJSON Data Schema
const GeoJSONDataSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, default: "FeatureCollection" },
    features: { type: [GeoJSONFeatureSchema], required: true },
  },
  { _id: false },
)

// Metadata Schema
const MetadataSchema = new mongoose.Schema(
  {
    totalFeatures: { type: Number, required: true },
    boundingBox: { type: BoundingBoxSchema, required: true },
    dataQuality: { type: DataQualitySchema, required: true },
  },
  { _id: false },
)

// Main Project Schema
const ProjectSchema = new mongoose.Schema(
  {
    projectInfo: { type: ProjectInfoSchema, required: true },
    geojsonData: { type: GeoJSONDataSchema, required: true },
    statistics: { type: ProjectStatisticsSchema, required: true },
    metadata: { type: MetadataSchema, required: true },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
    collection: "projects",
  },
)

// Indexes for better query performance
ProjectSchema.index({ "projectInfo.projectNumber": 1 })
ProjectSchema.index({ "projectInfo.region": 1 })
ProjectSchema.index({ "projectInfo.prefecture": 1 })
ProjectSchema.index({ "projectInfo.secteur": 1 })
ProjectSchema.index({ "projectInfo.status": 1 })
ProjectSchema.index({ "projectInfo.anneeProjet": 1 })
ProjectSchema.index({ "statistics.totalBuildings": 1 })
ProjectSchema.index({ "statistics.totalResidents": 1 })

// Create a 2dsphere index for geospatial queries
ProjectSchema.index({ "geojsonData.features.geometry": "2dsphere" })

// Virtual for getting project summary
ProjectSchema.virtual("summary").get(function () {
  return {
    projectNumber: this.projectInfo.projectNumber,
    region: this.projectInfo.region,
    prefecture: this.projectInfo.prefecture,
    totalBuildings: this.statistics.totalBuildings,
    totalResidents: this.statistics.totalResidents,
    status: this.projectInfo.status,
  }
})

// Static method to find projects by region
ProjectSchema.statics.findByRegion = function (region) {
  return this.find({ "projectInfo.region": region })
}

// Static method to find projects by year
ProjectSchema.statics.findByYear = function (year) {
  return this.find({ "projectInfo.anneeProjet": year })
}

// Instance method to get risk summary
ProjectSchema.methods.getRiskSummary = function () {
  const riskClassification = this.statistics.riskClassification
  const summary = {}

  for (const [key, value] of riskClassification) {
    summary[key] = value.count
  }

  return summary
}

// Pre-save middleware to validate data
ProjectSchema.pre("save", function (next) {
  // Ensure project number is uppercase
  if (this.projectInfo.projectNumber) {
    this.projectInfo.projectNumber = this.projectInfo.projectNumber.toString().toUpperCase()
  }

  // Validate that we have features
  if (!this.geojsonData.features || this.geojsonData.features.length === 0) {
    return next(new Error("Project must have at least one GeoJSON feature"))
  }

  // Validate that statistics match the number of features
  if (this.statistics.totalBuildings !== this.geojsonData.features.length) {
    return next(new Error("Statistics totalBuildings must match the number of features"))
  }

  next()
})

// Export the model
const Project = mongoose.model("Project", ProjectSchema)

module.exports = Project
