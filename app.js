const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const moment = require('moment');
const numeral = require('numeral');
const exec = require('child_process').exec;
const GitHubWebhook = require('express-github-webhook');

const config = require('./config');
const webhookHandler = GitHubWebhook({ path: '/pull', secret: config.GITHUB_SECRET });

const routes = require('./routes/index');

const app = express();
const hbs = require('hbs');

// configure Handlebars
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('formatDate', (datetime) => {
	return moment(datetime).format('DD MMMM YYYY');
});

hbs.registerHelper('formatNumber', (num, format) => {
	return numeral(num).format(format);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(webhookHandler);

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use((err, req, res, next) => {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

webhookHandler.on('push', (repo, data) => {
	// run git pull
	exec('cd /var/www/html/c.armno.xyz && git pull origin master && npm install',
		(error, stdout, stderror) => {
			if (error) {
				console.error(error);
			} else {
				console.info(stdout);
			}
		});
});

module.exports = app;
