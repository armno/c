#!/usr/bin/env node

const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const rp = require('request-promise');
const moment = require('moment');

/**
 * get elevation data from strava api
 */
function getElevationFromStrava() {
	const BASEURL = `https://www.strava.com/api/v3`;
	const options = {
		uri: `${BASEURL}/athletes/${config.PROFILE_ID}/stats`,
		headers: {
			Authorization: `Bearer ${config.API_KEY}`
		},
		json: true
	};

	return rp(options);
}

function updateData(response) {
	// fields to save
	// `updatedAt` - current time
	// `count`
	// `distance`
	// `elevation_gain`
	const record = {
		updated_at: moment().unix(),
		count: response.all_ride_totals.count,
		distance: response.all_ride_totals.distance,
		elevation_gain: response.all_ride_totals.elevation_gain
	};

	MongoClient.connect('mongodb://localhost:27017/c', (err, db) => {
		if (err) {
			throw err;
		}

		db.collection('elevations').insert(record, (e) => {
			if (e) {
				console.error('error on updating data');
				console.error(e);
				return;
			}

			console.log('new record was created: ', record._id);
			process.exit();
		});
	});
}

getElevationFromStrava()
	.then(updateData)
	.catch(err => {
		console.error(err);
	});


