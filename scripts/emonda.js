#!/usr/bin/env node

// THIS SCRIPT IS USED ONLY ONCE!
const config = require('../config');
const rp = require('request-promise');
const MongoClient = require('mongodb').MongoClient;

/**
 * get all rides of the Émonda
 * @return {promise}
 */
function getEmondaActivities() {
	const EMONDA_ID = 'b3027991';
	const RIDE_TYPE = 'Ride';
	const BASEURL = `https://www.strava.com/api/v3`;
	const FIRST_RIDE_DATE = '1467849600'; // 7/7/2016
	const options = {
		uri: `${BASEURL}/athletes/${config.PROFILE_ID}/activities?after=${FIRST_RIDE_DATE}&per_page=200`,
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
 * save all rides into the db
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

	MongoClient.connect('mongodb://localhost:27017/c', (err, db) => {
		if (err) {
			throw err;
		}

		db.collection('rides').insert(simplifiedActivities, (e) => {
			if (e) {
				console.error('error on saving data');
				console.error(e);
				return;
			}

			console.info(`saved ${simplifiedActivities.length} records`);
			process.exit();
		});
	});
}

getEmondaActivities()
	.then(saveEmondaActivites)
	.catch(err => {
		console.error(err);
	});
