const  express = require( "express");
const  { get } = require( "mongoose");
const router = express.Router();

router.get('/ping', (req, res) => {
    res.send('pong');
});

module.exports = router;