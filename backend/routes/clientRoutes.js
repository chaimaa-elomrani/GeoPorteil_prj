const express = require('express'); 
const router = express.Router(); 
const clientController = require('../controllers/clientController');

// Add this at the top of your routes for testing
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: "Client routes are working!",
    timestamp: new Date()
  });
});

router.get('/show', clientController.getAllClients); 
router.get('/stats', clientController.getClientStats);
router.get('/getClient/:id', clientController.getClientById);
router.post('/add', clientController.createClient);
router.put('/update/:id', clientController.updateClient);
router.delete('/delete/:id', clientController.deleteClient);
router.put('/:id/archive', clientController.archiveClient);
router.put('/:id/blacklist', clientController.blacklistClient);
router.put('/:id/unblacklist', clientController.unblacklistClient); 
router.put('/:id/unarchive', clientController.unarchiveClient); 


module.exports = router; 