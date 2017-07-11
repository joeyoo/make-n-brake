function DiscTray(childProcess) {
	this.childProcess = childProcess;
}

DiscTray.prototype.isLoaded = function(state) {
	var that = this;
	return new Promise(function(resolve,reject) {
		var checker = that.childProcess.spawn('drutil', ['discinfo']);

		checker.stdout.on('data', function(data) {
			resolve(!/Please insert a disc to get disc info/.test(data));
		})
	})
}

DiscTray.prototype.eject = function(trayNum) {
	trayNum = trayNum || '1';

	this.childProcess.spawn('drutil', ['tray', 'eject', trayNum]);
};

DiscTray.prototype.close = function(trayNum) {
	trayNum = trayNum || '1';

	this.childProcess.spawn('drutil', ['tray', 'close', trayNum]);
};

DiscTray.prototype.pollForDisc = function() {
	var tray = this;

	return new Promise(function(resolve,reject) {

		setInterval(function() {
			var interval = this;

			tray.isLoaded().then(function(loaded) {
				if (loaded) clearInterval(interval);
console.log(loaded)				
				resolve(loaded);
			});

		}, 1000);

	})

};

module.exports = DiscTray;