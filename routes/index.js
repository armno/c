const express = require('express');
const router = express.Router();
const request = require('request');

const BASEURL = `https://www.strava.com/api/v3`;
const config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {

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

			// put to `data`
			const data = {
				currentMeters: result.all_ride_totals.elevation_gain,
				targetMeters: 100000,
				title: '#YOLO'
			}
			res.render('index', data);
		} else {
			res.render('error');
		}
	})

});

router.post('/pull', (req, res) => {
	// verify the request if it really comes from github webhook
	// exec shellscript to pull
	console.log(req.body);
	res.send('awesome!');
});

module.exports = router;
