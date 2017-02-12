if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/worker.js')
		.then(() => {
			console.log('ServiceWorker is registered.');
		}, () => {
			console.warn('Failed to register ServiceWorker.');
		});
} else {
	console.warn('ServiceWorker is not supported.');
}
