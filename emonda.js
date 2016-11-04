#!/usr/bin/env node

const config = require('./config');
const rp = require('request-promise');

function getEmondaActivities() {
	const EMONDA_ID = 'b3027991';
	const RIDE_TYPE = 'Ride';
	const BASEURL = `https://www.strava.com/api/v3`;
	const options = {
		uri: `${BASEURL}/athletes/${config.PROFILE_ID}/activities?after=1467849600&per_page=200`,
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

function saveEmondaActivites(activities) {
	// save in mongodb
	// what to save?
}

getEmondaActivities()
	.then(saveEmondaActivites)
	.catch(err => {
		console.error(err);
	});
