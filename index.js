var os = require('os'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	path = require('path'),
	childProcess = require('child_process'),
	readline = require('readline'),
	EventEmitter = require('events'),
	DiscTray = require('./modules/DiscTray.js'),
	MakeMKV = require('./modules/MakeMKV.js'),
	State = require('./modules/State.js'),
	Events = new EventEmitter(),
	CLI = readline.createInterface({input: process.stdin, output: process.stdout }),
	tray = new DiscTray(childProcess),
	makemkv = new MakeMKV(childProcess);

CLI.on('line', handleReservedInputs);

var INITIAL_STATE = {
	fileQueue: [],
	makingMKV: false,
	encoding: false,
	currentlyMaking: '',
	currentlyEncoding: '',

	discTray: {
		isLoaded: false, 
		polling: false
	},

	projectInfo: {
		provided: false,
		name:'',
		requesterLastName: '',
		department: '',
		dirName: ''
	}
}



loadState(INITIAL_STATE).then(function(state_0) { console.log("state_0 =", state_0);

	setProjectInfo(state_0).then(function(state_1) { console.log("state_1 =", state_1);

		createOrFindProjectDir(state_1).then(function(state_2) { console.log("state_2 =", state_2);

				var state = new State(state_2, EventEmitter);

				Events.on('madeMKV', function() {
					// eject tray
					// getDiscNum()
					handbrake().then(function() {
						Events.emit('encoded');
					})
				})

				Events.on('gotDiscNum', function(discNum) {
					makemkv.mkv(discNum).then(function() {
						Events.emit('madeMKV');
					})
				})

				Events.on('trayLoaded', function(store) {
					store.discTray.isLoaded = true;

					state.emitter.emit('state', store);

					// getDiscNum().then(function(discNum) {
					// 	Events.emit('gotDiscNum', discNum);
					// })
				})

				Events.on('ejectTray', function(store) {
					tray.eject(); store.discTray.isLoaded = false;

					tray.pollForDisc().then(function(loaded){
						store.discTray.polling = true;

						if (loaded) { 
							store.discTray.polling = false;
							Events.emit('trayLoaded', store);
						};
					})
				})

			Events.emit("ejectTray", state.store);

		});
	});
});

function getDiscNum() {
	return new Promise(function(resolve,reject) {
		CLI.question('Disc Num:\n>', function(num) {
			var prepend = "";
			for (var i = num.length; i < 3; i++) {
				prepend += "0";
			};
			num = prepend + num;
			resolve(num);
		});
	});

};

function ensureTrayIsLoaded(state) {
	return new Promise(function(resolve,reject) {

		setTimeout(function() {
			var that = this;
			checkForDisc(state).then(function(newState){
				setInterval(function() {
					if (newState.discTray.isLoaded) {
						clearInterval(this);
						clearTimeout(that);
						resolve(newState);
					}
					else { console.log("TRAY IS EMPTY");
						checkForDisc(newState).then(function(newerState){
							resolve(newerState);
						})
					}
					
				}, 2000);
			})
		}, 2000);
	});
}

function checkForDisc(state) {
	return new Promise(function(resolve,reject) {
		var checker = childProcess.spawn('drutil', ['discinfo']);

		checker.stdout.on('data', function(data) {
			state.discTray.isLoaded = !/Please insert a disc to get disc info/.test(data);
			resolve(state);
		})
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

function mkvPath(state) {
	return path.resolve(os.homedir(), 'Desktop/OnlineMovies', state.projectInfo.dirName, 'MKV');
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

	if (input=="eject") {tray.eject()}
	else if (input=="quit") {CLI.close()}
	else if (input=="close") {tray.close()}
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


