const express = require('express');
const router = express.Router();
const request = require('request');

const BASEURL = `https://www.strava.com/api/v3`;
const config = require('../config');

const MongoClient = require('mongodb').MongoClient;

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
					db.collection('elevation').save(elevation, (err, res) => {
						if (err) {
							return console.error(err);
						}

						console.log('saved into db');
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

module.exports = router;
