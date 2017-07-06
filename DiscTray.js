function DiscTray(childProcess) {
	this.childProcess = childProcess;
	this.trayIsEmpty = this.checkForDisc;
}

DiscTray.prototype.checkForDisc = function() {
	var check = this.childProcess.spawn('drutil', ['discinfo']);

	check.stdout.on('data', function(data) {
		return /Please insert a disc to get disc info/.test(data);
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
		return setInterval(function() {
			if (tray.trayIsEmpty) {
				console.log("TRAY IS EMPTY");
			}
			else {
				clearInterval(this);
				console.log("TRAY IS NOT EMPTY");	
			}
			tray.checkForDisc();
		}, 2000);
	}, 2000);

};

module.exports = DiscTray;