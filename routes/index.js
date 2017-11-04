const express = require('express');
const router = express.Router();
const request = require('request');
const rp = require('request-promise');
const moment = require('moment');
const numeral = require('numeral');

const TARGET = 150000;
const Ride = require('../db/rides').Ride;

router.get('/', getIndex);
router.get('/rides', getRides);
router.get('/goal', getGoal);

module.exports = router;

/**** Implemetation details *****/

/**
 * home page route: display current meters and goal
 *
 * @param  {Request}   req
 * @param  {Response}  res
 * @param  {Function}  next
 */
function getIndex(req, res, next) {
	Ride.find({}, (err, rides) => {

		if (err) {
			throw err;
		}

		var meters = sumThings(rides, 'total_elevation_gain');
		meters = 119000;

		// get data from `rides` collection
		// sum all records to get current elevation
		res.render('index', {
			currentMeters: meters,
			targetMeters: TARGET,
			containerClass: 'flex'
		});
	});
}

/**
 * /rides page route: display activity logs
 *
 * @param  {Request}   req
 * @param  {Response}   res
 * @param  {Function} next
 */
function getRides(req, res, next) {
	Ride.find({}, (err, rides) => {
		if (err) {
			throw err;
		}

		rides.sort(sortActivitiesByStravaId);

		const numRides = rides.length;
		const elevations = sumThings(rides, 'total_elevation_gain');
		const distance = sumThings(rides, 'distance') / 1000;

		res.render('logs', {
			rides,
			numRides,
			elevations,
			distance
		});
	});
}

function getGoal(req, res, next) {
	res.render('page');
}

/**
 * summarize total of `prop` where prop is a number-type value
 *
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
 *
 * @param  {Ride} a
 * @param  {Ride} b
 * @return {number}
 */
function sortActivitiesByStravaId(a, b) {
	if (a.activity_id > b.activity_id) {
		return -1;
	}

	if (a.activity_id < b.activity_id) {
		return 1;
	}

	return 0;
}
