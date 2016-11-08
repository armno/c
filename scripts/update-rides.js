#!/usr/bin/env node

const config = require('../config');
const rp = require('request-promise');
const moment = require('moment');
const Ride = require('../db/rides').Ride;

/**
 * get new ride activities of the bike since the last 1 day
 * @return {promise}
 */
function getYesterdayRides() {
	const EMONDA_ID = 'b3027991';
	const RIDE_TYPE = 'Ride';
	const LIMIT = 5;
	const BASEURL = `https://www.strava.com/api/v3`;

	const yesterday = moment().subtract(1, 'days').format('X');
	const options = {
		uri: `${BASEURL}/athletes/${config.PROFILE_ID}/activities?after=${yesterday}&per_page=${LIMIT}`,
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
	var newRides = activities.map(activity => {
		return new Ride({
			activity_id: activity.id,
			name: activity.name,
			distance: activity.distance,
			total_elevation_gain: activity.total_elevation_gain,
			start_date: activity.start_date,
			elev_high: activity.elev_high,
			elev_low: activity.elev_low
		});
	});

	console.info(`INFO: Found new ${newRides.length} rides from strava`);

	if (newRides.length === 0) {
		console.info(`INFO: No new rides. Exiting ...`);
		process.exit();
	}

	Ride.create(
		newRides,
		(e, result) => {
		if (e) {
			console.error(`ERROR: ${e.message}`);
		}

		console.info(`INFO: Saved new records.`);
		process.exit();
	});

}

getYesterdayRides()
	.then(saveEmondaActivites)
	.catch(err => {
		console.error(err);
	});
