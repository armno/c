const express = require('express');
const router = express.Router();
const request = require('request');
const rp = require('request-promise');
const moment = require('moment');

const target = 100000;

const Ride = require('../db/rides').Ride;

/**
 * summarize total of `prop`
 * @param  {array} rides
 * @param  {string} prop
 * @return {number}
 */
function sumThings(rides, prop) {
	return rides.reduce((a, b) => {
		return a + b[prop];
	}, 0);
}

/**
 * sort activities array by newest-first
 * @param  {Ride} a
 * @param  {Ride} b
 * @return {number}
 */
function sortActivities(a, b) {
	if (a.activity_id > b.activity_id) {
		return -1;
	}

	if (a.activity_id < b.activity_id) {
		return 1;
	}

	return 0;
}

router.get('/', (req, res, next) => {

	Ride.find({}, (err, rides) => {

		if (err) {
			throw err;
		}

		var meters = sumThings(rides, 'total_elevation_gain');

		// get data from `rides` collection
		// sum all records to get current elevation
		res.render('index', {
			currentMeters: meters.toFixed(0).toLocaleString(),
			targetMeters: 100000,
			containerClass: 'flex'
		});
	});

});

router.get('/logs', (req, res, next) => {
	Ride.find({}, (err, rides) => {
		if (err) {
			throw err;
		}

		rides.sort(sortActivities);

		// number of Rides
		// total elevation gain
		// total distance
		const numRides = rides.length;
		const elevations = sumThings(rides, 'total_elevation_gain').toFixed(2);
		const distance = (sumThings(rides, 'distance') / 1000).toFixed(2);

		res.render('logs', {
			rides,
			numRides,
			elevations,
			distance
		});
	});
});

module.exports = router;
