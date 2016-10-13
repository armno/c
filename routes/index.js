const express = require('express');
const router = express.Router();
const request = require('request');
const rp = require('request-promise');
const moment = require('moment');

const BASEURL = `https://www.strava.com/api/v3`;
const config = require('../config');

const MongoClient = require('mongodb').MongoClient;

router.post('/clear', (req, res, next) => {
	MongoClient.connect('mongodb://localhost:27017/c', (err, db) => {
		if (err) {
			throw err;
		}

		db.collection('elevation').remove().then(result => {
			res.send('ok');
		});
	});
});

/* GET home page. */
router.get('/', function(req, res, next) {

	MongoClient.connect('mongodb://localhost:27017/c', (err, db) => {
		if (err) {
			 throw err;
		}

		db.collection('elevation').find().toArray((err, result) => {
			if (err) {
				throw err;
			}
			console.log(result);

			if (result.length !== 0) {
				// there is an existing record
				// if last updated date was longer than x days,
				const updatedAt = moment(result[result.length - 1].updatedAt);
				const now = moment();
				const interval = 100; // 10 seconds
				const timeDiff = now.diff(updatedAt, 'seconds');
				console.log(`last update was ${timeDiff} seconds ago.`);

				if (timeDiff > interval) {
					console.info('data was too old. updating ...');
					// get fresh data from strava and save into db
					getElevationFromStrava()
						.then(elevation => {
							saveCurrentElevation(db, elevation);
						});
				} else {
					console.info('still fresh data na');
				}
			}

		 if (result.length === 0) {
			 // get data from strava api and save into the db

			const url = `${BASEURL}/athletes/${config.PROFILE_ID}/stats`;

			// make api request to strava api
			request.get({
				url: url,
				headers: {
					Authorization: `Bearer ${config.API_KEY}`
				}
			}, (err, response, body) => {
				if (!err && response.statusCode === 200) {
					// grab json
					// parse
					const result = JSON.parse(body);
					console.log('got data from strava api');
					const now = new Date().getTime();
					const elevation = {
						name: result.all_ride_totals.elevation_gain,
						updatedAt: now
					};
					db.collection('elevation').save(elevation, (err, result) => {
						if (err) {
							return console.error(err);
						}

						console.log('saved into db');
						res.render('index', {
							currentMeters: elevation.name,
							targetMeters: 100000,
							title: '#Y0LO'
						})
					});
				} else {
					console.error(err);
				}
			});
		 } else {
			 console.log('got value from db', result[0]);
			 res.render('index', {
				currentMeters: result[0].name,
				targetMeters: 100000,
				title: '#YOLO'
			 });
		 }
	 });
	});
});

function getElevationFromStrava() {
	const options = {
		uri: `${BASEURL}/athletes/${config.PROFILE_ID}/stats`,
		headers: {
			Authorization: `Bearer ${config.API_KEY}`
		},
		json: true
	};

	return rp(options).then(response => response.all_ride_totals.elevation_gain);
}

function saveCurrentElevation(db, elevation) {
	const data = {
		name: elevation,
		updatedAt: moment().unix()
	}
	db.collection('elevation').save(data, (err, result) => {
		if (err) {
			return console.error(err);
		}

		console.log('saved into db');
	});
}

module.exports = router;
