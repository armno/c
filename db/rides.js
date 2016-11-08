const uri = 'mongodb://localhost:27017/c';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(uri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', (callback) => {
	console.log('db connected');
});

const rideSchema = new Schema({
	activity_id: {
		type: Number,
		unique: true,
		index: true
	},
	name: String,
	distance: Number,
	total_elevation_gain: Number,
	start_date: Date,
	elev_high: Number,
	elev_low: Number
},
{
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

exports.Ride = mongoose.model('Ride', rideSchema);
