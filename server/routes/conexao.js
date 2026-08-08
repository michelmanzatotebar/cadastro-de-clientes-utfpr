var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json({ status: 'conectado OK' });
});

module.exports = router;
