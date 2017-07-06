function DiscTray(childProcess, events, state) {
	this.childProcess = childProcess;
	this.trayIsEmpty = true;
	this.events = events;
	this.state = state;
}

DiscTray.prototype.checkForDisc = function() {
	var check = this.childProcess.spawn('drutil', ['discinfo']);
	var tray = this;

	check.stdout.on('data', function(data) {
		tray.trayIsEmpty = /Please insert a disc to get disc info/.test(data);
	});
};

DiscTray.prototype.eject = function(trayNum) {
	trayNum = trayNum || '1';

	this.childProcess.spawn('drutil', ['tray', 'eject', '1']);
};

DiscTray.prototype.pollForDisc = function() {
	var tray = this;
	tray.checkForDisc();

	setTimeout(function() {
		var that = this;
		tray.checkForDisc();
		setInterval(function() {
			if (tray.trayIsEmpty) {
				console.log("TRAY IS EMPTY");
			}
			else {
				clearInterval(this);
				clearTimeout(that);
				console.log("TRAY IS NOT EMPTY");	
				tray.events.emit('trayLoaded', state);
				return state;
			}
			
		}, 2000);
	}, 2000);

};

module.exports = DiscTray;