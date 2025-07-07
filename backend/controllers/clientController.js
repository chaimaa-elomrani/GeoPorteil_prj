const Client = require("../models/Client");

const clientController = {
    // GET /api/clients - Get all clients
    getAllClients: async (req, res) => {
        try {
            console.log("=== Getting all clients ===");
            
            const clients = await Client.find({})
                .sort({ createdAt: -1 })
                .select('-__v');
            
            console.log("Found clients:", clients.length);

            res.json({
                success: true,
                message: "Clients fetched successfully",
                data: {
                    clients,
                    count: clients.length
                }
            });
        } catch (error) {
            console.error("Error fetching clients:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // GET /api/clients/:id - Get client details by ID
    getClientById: async (req, res) => {
        try {
            const { id } = req.params;
            console.log("Getting client by ID:", id);
            
            const client = await Client.findById(id).select('-__v');
            
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: "Client not found"
                });
            }

            res.json({
                success: true,
                message: "Client details fetched successfully",
                data: { client }
            });
        } catch (error) {
            console.error("Error fetching client details:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    },

    // POST /api/clients - Create new client
    createClient: async (req, res) => {
        try {
            const clientData = req.body;
            console.log("Creating client with data:", clientData);

            // Simple duplicate check for ICE and email
            if (clientData.ICE) {
                const existingICE = await Client.findOne({ ICE: clientData.ICE });
                if (existingICE) {
                    return res.status(400).json({
                        success: false,
                        message: "Client with this ICE number already exists"
                    });
                }
            }

            if (clientData.email) {
                const existingEmail = await Client.findOne({ email: clientData.email.toLowerCase() });
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        message: "Client with this email already exists"
                    });
                }
            }

            const newClient = new Client(clientData);
            await newClient.save();

            console.log("Client created successfully:", newClient._id);

            res.status(201).json({
                success: true,
                message: "Client created successfully",
                data: { client: newClient }
            });
        } catch (error) {
            console.error("Error creating client:", error);
            
            // Handle MongoDB duplicate key errors
            if (error.code === 11000) {
              const duplicateField = Object.keys(error.keyPattern)[0];
              return res.status(400).json({
                success: false,
                message: `Client with this ${duplicateField} already exists`,
                duplicateField: duplicateField
              });
            }
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
              const validationErrors = Object.values(error.errors).map(err => err.message);
              return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: validationErrors
              });
            }

            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // PUT /api/clients/:id - Update client

    updateClient: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            console.log("Updating client:", id, "with data:", updateData);

            const updatedClient = await Client.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }

            ).select('-__v');

            if (!updatedClient) {
                return res.status(404).json({
                    success: false,
                    message: "Client not found",
                });
            }

            res.json({
                success: true,
                message: "Client updated successfully",
                data: {
                    client: updatedClient,
                },
            });
        } catch (err) {
            console.error("Error updating client:", err);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },


    // DELETE /api/clients/:id - Delete client
    deleteClient: async (req, res) => {
        try {
            const { id } = req.params;
            console.log("Deleting client:", id);

            const deletedClient = await Client.findByIdAndDelete(id);

            if (!deletedClient) {
                return res.status(404).json({
                    success: false,
                    message: "Client not found",
                });
            }

            res.json({
                success: true,
                message: "Client deleted successfully"
            });
        } catch (err) {
            console.error("Error deleting client:", err);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },


    // PUT /api/clients/:id/archive - Archive client

    archiveClient: async (req, res) => {
        try {
            const { id } = req.params;
            console.log("Archiving client:", id);

            const client = await Client.findById(id);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: "Client not found",
                });
            }

            if (client.isArchived) {
                return res.status(400).json({
                    success: false,
                    message: "Client is already archived",
                });
            }

            const archivedClient = await Client.findByIdAndUpdate(
                id,
                { isArchived: true },
                { new: true }
            );

            console.log("Client archived successfully");

            res.json({
                success: true,
                message: "Client archived successfully",
                data: { client: archivedClient },
            });
        } catch (err) {
            console.error("Error archiving client:", err);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },

 
    
    // PUT /api/clients/:id/blacklist - Blacklist client
  blacklistClient: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      console.log("Blacklisting client:", id, "Reason:", reason);

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Blacklist reason is required"
        });
      }

      const client = await Client.findById(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client not found"
        });
      }

      if (client.isBlacklisted) {
        return res.status(400).json({
          success: false,
          message: "Client is already blacklisted"
        });
      }

      const blacklistedClient = await Client.findByIdAndUpdate(
        id,
        { 
          isBlacklisted: true,
          balckListedRaison: reason, // Note: keeping your original field name
          balckListedAt: new Date()
        },
        { new: true }
      );

      console.log("Client blacklisted successfully");

      res.json({
        success: true,
        message: "Client blacklisted successfully",
        data: { client: blacklistedClient }
      });
    } catch (error) {
      console.error("Error blacklisting client:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },


    // PUT /api/clients/:id/unblacklist - Remove client from blacklist

    unblacklistClient: async (req, res) => {
        try {
            const { id } = req.params;
            console.log("Removing client from blacklist:", id);

            const client = await Client.findById(id);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: "Client not found",
                });
            }

            if (!client.isBlacklisted) {
                return res.status(400).json({
                    success: false,
                    message: "Client is not blacklisted"
                });
            }

            const unblacklistedClient = await Client.findByIdAndUpdate(
                id,
                { 
                    isBlacklisted: false,
                    balckListedRaison: null,
                    balckListedAt: null
                },
                { new: true }
            );

            console.log("Client removed from blacklist successfully");

            res.json({
                success: true,
                message: "Client removed from blacklist successfully",
                data: { client: unblacklistedClient }
            });
        } catch (err) {
            console.error("Error removing client from blacklist:", err);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },

      // GET /api/clients/stats - Get client statistics

      getClientStats: async (req, res) => {
        try {
            console.log("=== Getting client stats ===");
            
            const totalClients = await Client.countDocuments();
            console.log("Total clients:", totalClients);
            
            const activeClients = await Client.countDocuments({ 
              isArchived: false, 
              isBlacklisted: false 
            });
            console.log("Active clients:", activeClients);
            
            const archivedClients = await Client.countDocuments({ isArchived: true });
            console.log("Archived clients:", archivedClients);
            
            const blacklistedClients = await Client.countDocuments({ isBlacklisted: true });
            console.log("Blacklisted clients:", blacklistedClients);

            res.json({
                success: true,
                message: "Client statistics fetched successfully",
                data: {
                    stats: {
                        total_clients: totalClients,
                        active_clients: activeClients,
                        archived_clients: archivedClients,
                        blacklisted_clients: blacklistedClients
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching client stats:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
      },

      // PUT /api/clients/:id/unarchive - Unarchive client
      unarchiveClient: async (req, res) => {
        try {
            const { id } = req.params;
            console.log("Unarchiving client:", id);

            const client = await Client.findById(id);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: "Client not found"
                });
            }

            if (!client.isArchived) {
                return res.status(400).json({
                    success: false,
                    message: "Client is not archived"
                });
            }

            const unarchivedClient = await Client.findByIdAndUpdate(
                id,
                { isArchived: false },
                { new: true }
            );

            console.log("Client unarchived successfully");

            res.json({
                success: true,
                message: "Client unarchived successfully",
                data: { client: unarchivedClient }
            });
        } catch (error) {
            console.error("Error unarchiving client:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
      }
}; 

module.exports = clientController;