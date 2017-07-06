var os = require('os'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	path = require('path'),
	childProcess = require('child_process'),
	readline = require('readline'),
	EventEmitter = require('events'),
	DiscTray = require('./DiscTray.js'),
	MakeMKV = require('./makemkv.js'),
	Events = new EventEmitter(),
	CLI = readline.createInterface({input: process.stdin, output: process.stdout });

CLI.on('line', handleReservedInputs);

var INITIAL_STATE = {
	fileQueue: [],
	makingMKV: false,
	encoding: false,
	currentlyMaking: '',
	currentlyEncoding: '',

	discTray: {
		isLoaded: false
	},

	projectInfo: {
		provided: false,
		name:'',
		requesterLastName: '',
		department: '',
		dirName: ''
	}
}

	// Events.on('trayLoaded', function(state) {
	// 	state.discTray.isLoaded = true;
	// })

	// Events.on('ejectTray', function(tray) {
	// 	tray.pollForDisc();
	// });

loadState(INITIAL_STATE).then(function(state_0) { console.log("state_0 =", state_0);
	// var tray = new DiscTray(childProcess, Events),
	// 	makemkv = new MakeMKV(childProcess);

	setProjectInfo(state_0).then(function(state_1) { console.log("state_1 =", state_1);

		createOrFindProjectDir(state_1).then(function(state_2) { console.log("state_2 =", state_2);

			ensureTrayIsLoaded(state_2).then(function(state_3) { console.log("state_3 =", state_3);
				// prompt user for disc num
				// makemkv
					// - put in mkv dir
					// - rename w/ disc num
				// handbrake
					// - put in mp4 dir

			});

			// poll for disc until loaded


			// tray.pollForDisc();

		});
	});
});

function ensureTrayIsLoaded(state, childProcess) {
	return new Promise(function(resolve,reject) {

		setTimeout(function() {
			state = checkForDisc(state);
			setInterval(function() {
				if (state.discTray.isLoaded) {
					clearInterval(this);
					clearTimeout(that);
					resolve(state);
				}
				else { console.log("TRAY IS EMPTY");
					state = checkForDisc(state);
				}
				
			}, 2000);
		}, 2000);
	});
}

function checkForDisc(state) {
	var checker = childProcess.spawn('drutil', ['discinfo']);

	checker.stdout.on('data', function(data) {
		state.discTray.isLoaded = !/Please insert a disc to get disc info/.test(data);
		return state;
	})
}


function renameMKV(args) {
	var number = args.number || '',
		lastName = args.lastName || '',
		department = args.department || '',
		projectName = args.projectName || '',
		filename = number +'-'+ department +'-'+ lastName +'-'+ projectName + '.mkv';

// if num of titles < 1
	var oldPath = '_makingMKV/' + fileQueue[0],
		newPath = '_makingMKV/' +  filename;

	fs.rename(oldPath,newPath,function(err){
		if (err) console.log(err);
	});

}

function mkvPath() {
	return path.resolve(os.homedir(), 'Desktop/OnlineMovies', APP.dirName);
}

function makeMKV(pathName) {
	var mkv = makemkv.mkv(pathName);

	mkv.stdout.on('data', (data) => {
	  console.log(`stdout: ${data}`);
	});

	mkv.on('close', (code) => {
	  console.log(`child process exited with code ${code}`);
	  /* 
	  if (code == "0") {
		renameMKV();
		ejectDisc();
		encode();
	  }
	  */
	});
};

function handleReservedInputs(input) {
	input = input.trim();

	if (input=="eject") {tray.ejectTray()};
	if (input=="quit") {CLI.close()};
};


function setProjectInfo(state_0) { 
	return new Promise(function(resolve, reject) {
		var state = state_0;

		CLI.question('Project Name (i.e. SeniorVideos):\n> ', function(name) {
			state.projectInfo.name = name;

			CLI.question('Requester Last Name (i.e. Duncan):\n> ', function(lastName) {
				state.projectInfo.requesterLastName = lastName;

				CLI.question('Department code (i.e. MCM)(optional):\n> ', function(department) {
					state.projectInfo.department = department || '';
					state.projectInfo.provided = true;

					state.projectInfo.dirName = state.projectInfo.requesterLastName +'-'+ state.projectInfo.name;

					resolve(state);
				});
		  	})
		});
	})
};

function createOrFindProjectDir(state_1) {
	return new Promise(function(resolve, reject) {
		var state = state_1;

		process.chdir(os.homedir()+'/Desktop'); // change working directory to Desktop

		mkdirp("OnlineMovies");

		var projectPath = "OnlineMovies/"+ state.projectInfo.dirName;

		mkdirp(projectPath);
		mkdirp(projectPath+'/MKV');
		mkdirp(projectPath+'/MP4');

		process.chdir('OnlineMovies');

		resolve(state);
	})
};

function loadState(state) {
	return new Promise(function(resolve,reject) {
		resolve(state);
	})
};

// function getFileInfo() {
// 	CLI.question('Disc Number (i.e. 001):\n> ', function(discNum) {

// 	})
// }


