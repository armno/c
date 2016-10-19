const express = require('express');
const router = express.Router();
const request = require('request');
const rp = require('request-promise');
const moment = require('moment');

const MongoClient = require('mongodb').MongoClient;
const target = 100000;

/* GET home page. */
router.get('/', function(req, res, next) {

	MongoClient.connect('mongodb://localhost:27017/c', (err, db) => {
		if (err) {
			throw err;
		}

		db.collection('elevations')
			.find()
			.sort({ 'updated_at': -1 })
			.limit(1)
			.toArray((err, result) => {
				if (err) {
					throw err;
				}

				res.render('index', {
					currentMeters: result[0].elevation_gain.toLocaleString(),
					targetMeters: target.toLocaleString(),
					lastUpdate: moment(result[0].updated_at).format('MMMM Do YYYY, h:mm:ss')
				});
		 });
	});
});

module.exports = router;
