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

			if (result.length !== 0) {
				// there is an existing record
				// if last updated date was longer than x days,
				const latestRecord = result[result.length - 1];
				const updatedAt = moment(latestRecord.updatedAt);
				console.info('updated at', updatedAt.format('YYYY-MM-DD HH:mm:ss'));

				const timeDiff = moment().diff(updatedAt, 'days');
				console.info(`last update was ${timeDiff} days ago.`);

				const interval = 1; // 1 day
				if (timeDiff > interval) {
					console.info('data was too old. updating ...');
					// get fresh data from strava and save into db
					getElevationFromStrava()
						.then(elevation => {
							saveCurrentElevation(db, elevation, (data) => {
								res.render('index', {
									currentMeters: data.name,
									targetMeters: 100000,
									title: '#BEATTODAY'
								});
							});
						});
						// render with `elevation`
				} else {
					console.info('using data from db');
					// render with current value from db
					res.render('index', {
						currentMeters: latestRecord.name,
						targetMeters: 100000,
						title: '#BEATYESTERDAY'
					});
				}
			} else {
				console.info('db is empty. getting new data from strava');
				// @TODO - duplicates
				getElevationFromStrava()
					.then(elevation => {
						saveCurrentElevation(db, elevation, (data) => {
							res.render('index', {
								currentMeters: data.name,
								targetMeters: 100000,
								title: '#FRESHMAN'
							});
						});
					});
			}
	 });
	});
});

/**
 * get elevation data from strava api
 */
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

/**
 * save elevation data into the db, with `updatedAt` field
 * which will be used to determine if the app should update
 * data from api or not in the next page loads
 */
function saveCurrentElevation(db, elevation, cb) {
	const data = {
		name: elevation,
		updatedAt: new Date().getTime()
	};

	db.collection('elevation').save(data, (err, result) => {
		if (err) {
			return console.error(err);
		}

		console.log('saved into db');
		cb(data);
	});
}

module.exports = router;
