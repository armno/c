const express = require('express');
const router = express.Router();
const request = require('request');
const rp = require('request-promise');
const moment = require('moment');

const target = 100000;

const Ride = require('../db/rides').Ride;

router.get('/', (req, res, next) => {

	Ride.find({}, (err, rides) => {

		if (err) {
			throw err;
		}

		var meters = rides.reduce((a, b) => {
			return a + b.total_elevation_gain;
		}, 0);

		// get data from `rides` collection
		// sum all records to get current elevation
		res.render('index', {
			currentMeters: meters.toFixed(0).toLocaleString(),
			targetMeters: 100000
		});
	});

});

module.exports = router;
