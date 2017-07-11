function MakeMKV(childProcess) {
	this.cp = childProcess;
	this.command = "makemkvcon";
}

MakeMKV.prototype.mkv = function(pathName, discNum) {
	var opts = ['-r', 'mkv', 'disc:0', 'all', pathName]

	return this.cp.spawn(this.command, opts)
}

module.exports = MakeMKV;

