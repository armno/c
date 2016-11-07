#!/usr/bin/env node

const config = require('../config');
const rp = require('request-promise');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;

function getYesterdayRides() {
	const yesterday = moment().subtract(3, 'days').format('X');
	const EMONDA_ID = 'b3027991';
	const RIDE_TYPE = 'Ride';
	const BASEURL = `https://www.strava.com/api/v3`;
	const options = {
		uri: `${BASEURL}/athletes/${config.PROFILE_ID}/activities?after=${yesterday}&per_page=5`,
		headers: {
			Authorization: `Bearer ${config.API_KEY}`
		},
		json: true
	};

	return rp(options)
		.then(response => {
			return response.filter(r => {
				return (r.gear_id === EMONDA_ID && r.type === RIDE_TYPE);
			});
		});
}

/**
 * save new rides into the db
 * @param  {array} activities
 * @return
 */
function saveEmondaActivites(activities) {
	var simplifiedActivities = activities.map(activity => {
		return {
			activity_id: activity.id,
			name: activity.name,
			distance: activity.distance,
			total_elevation_gain: activity.total_elevation_gain,
			start_date: activity.start_date,
			elev_high: activity.elev_high,
			elev_low: activity.elev_low
		};
	});

	console.info(`INFO: Found new ${simplifiedActivities.length} rides from strava`);

	if (simplifiedActivities.length === 0) {
		return;
	}

	MongoClient.connect('mongodb://localhost:27017/c', (err, db) => {
		if (err) {
			throw err;
		}

		db.collection('rides').insert(simplifiedActivities, (e) => {
			if (e) {
				console.error('ERROR:' + e.message);
				process.exit();
			}

			console.info(`saved ${simplifiedActivities.length} records`);
			process.exit();
		});
	});
}

getYesterdayRides()
	.then(saveEmondaActivites)
	.catch(err => {
		console.error(err);
	});
