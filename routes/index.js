var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	const data = {
		currentMeters: 37000,
		targetMeters: 100000
	};

  res.render('index', data);
});

module.exports = router;
