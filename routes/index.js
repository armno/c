const express = require('express');
const router = express.Router();
const request = require('request');

const BASEURL = `https://www.strava.com/api/v3`;
const config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {

	const url = `${BASEURL}/athletes/${config.PROFILE_ID}/statsz`;

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

			// put to `data`
			const data = {
				currentMeters: result.all_ride_totals.elevation_gain,
				targetMeters: 100000
			}
			res.render('index', data);
		} else {
			res.render('error');
		}
	})

});

module.exports = router;
