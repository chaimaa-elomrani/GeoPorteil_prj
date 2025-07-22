const mongoose = require("mongoose")
const Project = require("../models/Project")

// Your project data extracted from GeoJSON
const projectData = {
  projectInfo: {
    projectNumber: "216",
    anneeProjet: 2024,
    region: "Souss-Massa",
    prefecture: "Taroudannt",
    secteur: "DERB MOULAY CHERIF",
    dateCreation: new Date("2024-12-27T00:00:00.000Z"),
    status: "accepté",
  },
  geojsonData: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          Batiment_i: "486",
          Numero_Fi: "486",
          Date_Enqu: "2023/07/12",
          Enqueteur: "ZAIDANI Meriam",
          Ancienne_: "Non",
          "Secteur/Q": "DERB MOULAY CHERIF",
          Adresse: "N° 01 RUE 37 ET 19-21-23-25 RUE 36 DERB SAAD",
          Occupatio: "Occupé",
          Statut_Oc: "Propriétaires/Locataire",
          Statut_Sc: null,
          Proprieta: "Oui",
          Foncier: "Privé",
          Foncier_A: null,
          Superfici: 110.0,
          Type_Usag: "Habitat/Commerces",
          Type_Us_1: null,
          Type_Equi: null,
          Soussoll: "Non",
          Nombre_Ni: "R+2",
          Nombre_Lo: null,
          Nombre_Me: 3,
          Nombre_Re: 23,
          Nombre__1: 2,
          Nombre_Lu: 4,
          Conformit: null,
          Conform_1: null,
          Nombre_Ba: 3,
          Accessibl: "Oui",
          Motif_Acc: null,
          Typologie: "Maison Moderne",
          Typolog_1: null,
          Monument_: "Non",
          Valeur_Pa: "sans",
          Age_Batim: null,
          Classific: "Facteurs De Dégradation",
          Risque: "Sur Les Habitants",
          Risque_Au: null,
          Fiche_Bat: "E486",
          Photo: "486-1;486-2;486-3;486-4",
          Field2: "C:\\test web\\486_F01.jpg",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-7.5636943, 33.5950869, 0.0],
              [-7.5636937, 33.594964, 0.0],
              [-7.5636127, 33.5949631, 0.0],
              [-7.5636108, 33.5950862, 0.0],
              [-7.5636943, 33.5950869, 0.0],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          Batiment_i: "524",
          Numero_Fi: "524",
          Date_Enqu: "24/10/2023",
          Enqueteur: "A. HADI",
          Ancienne_: "Non",
          "Secteur/Q": "DERB MOULAY CHERIF",
          Adresse: "N° 15-17-19 RUE 38 DERB SAAD",
          Occupatio: "Occupé",
          Statut_Oc: "Propriétaires/Locataire",
          Statut_Sc: null,
          Proprieta: "Oui",
          Foncier: "Privé",
          Foncier_A: null,
          Superfici: 110.0,
          Type_Usag: "Habitat/Commerces",
          Type_Us_1: null,
          Type_Equi: null,
          Soussoll: "Non",
          Nombre_Ni: "R+2",
          Nombre_Lo: null,
          Nombre_Me: 2,
          Nombre_Re: 6,
          Nombre__1: 1,
          Nombre_Lu: 1,
          Conformit: null,
          Conform_1: null,
          Nombre_Ba: 3,
          Accessibl: "Oui",
          Motif_Acc: null,
          Typologie: "Maison Moderne",
          Typolog_1: null,
          Monument_: "Non",
          Valeur_Pa: "Sans",
          Age_Batim: null,
          Classific: "Danger",
          Risque: "Sur Les Habitants\n\n/Sur Les Passants\n/Sur La Mitoyenneté\n",
          Risque_Au: null,
          Fiche_Bat: "E524",
          Photo: "524-1;524-2;524-3;524-4",
          Field2: "C:\\test web\\524_F01.jpg",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-7.5634494, 33.5943423, 0.0],
              [-7.5634533, 33.5942744, 0.0],
              [-7.5633679, 33.5942742, 0.0],
              [-7.5632921, 33.5942755, 0.0],
              [-7.5632928, 33.5943403, 0.0],
              [-7.5634494, 33.5943423, 0.0],
            ],
          ],
        },
      },
    ],
  },
  statistics: {
    totalBuildings: 2,
    totalResidents: 29,
    averageResidentsPerBuilding: 14.5,
    totalSurface: 220,
    averageSurfacePerBuilding: 110,
    riskClassification: new Map([
      ["Facteurs_De_Degradation", { count: 1, percentage: 50 }],
      ["Danger", { count: 1, percentage: 50 }],
    ]),
    buildingTypes: new Map([
      ["Maison_Moderne", { count: 2, percentage: 100 }]
    ]),
    usageTypes: new Map([
      ["Habitat_Commerces", { count: 2, percentage: 100 }]
    ]),
    occupationStatus: new Map([
      ["Occupe", { count: 2, percentage: 100 }]
    ]),
    propertyOwnership: new Map([
      ["Prive", { count: 2, percentage: 100 }]
    ]),
    accessibility: {
      accessible: 2,
      notAccessible: 0,
      accessibilityRate: 100,
    },
    floorDistribution: new Map([
      ["R_plus_2", { count: 2, percentage: 100 }]
    ]),
    enqueteurs: new Map([
      ["ZAIDANI_Meriam", { count: 1, percentage: 50 }],
      ["A_HADI", { count: 1, percentage: 50 }],
    ]),
    dateRange: {
      earliest: "2023/07/12",
      latest: "24/10/2023",
    },
  },
  metadata: {
    totalFeatures: 2,
    boundingBox: {
      minLat: 33.5942742,
      maxLat: 33.5950869,
      minLng: -7.5636943,
      maxLng: -7.5632921,
    },
    dataQuality: {
      completeRecords: 2,
      incompleteRecords: 0,
      completenessRate: 100,
    },
  },
}

async function injectProject() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/geoporteil")
    console.log("Connected to MongoDB")

    // Create and save the project
    const project = new Project(projectData)
    const savedProject = await project.save()

    console.log("Project injected successfully!")
    console.log("Project ID:", savedProject._id)
    console.log("Project Number:", savedProject.projectInfo.projectNumber)
    console.log("Total Buildings:", savedProject.statistics.totalBuildings)
    console.log("Total Residents:", savedProject.statistics.totalResidents)
  } catch (error) {
    console.error("Error injecting project:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the injection
injectProject()
