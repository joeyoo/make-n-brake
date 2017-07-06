var os = require('os'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	path = require('path'),
	childProcess = require('child_process'),
	readline = require('readline'),
	DiscTray = require('./DiscTray.js'),
	MakeMKV = require('./makemkv.js');

var INITIAL_STATE = {
	fileQueue: [],
	makingMKV: false,
	encoding: false,
	currentlyMaking: '',
	currentlyEncoding: '',

	projectInfo: {
		provided: false,
		name:'',
		requesterLastName: '',
		department: '',
		dirName: ''
	}
}

loadState(INITIAL_STATE).then(function(state_0) { console.log("state_0 =", state_0);
	CLI = readline.createInterface({input: process.stdin, output: process.stdout });
	tray = new DiscTray(childProcess);
	makemkv = new MakeMKV(childProcess);

	CLI.on('line', handleReservedInputs);

	setProjectInfo(state_0).then(function(state_1) { console.log("state_1 =", state_1);

		createOrFindProjectDir(state_1).then(function(state_2) { console.log("state_2 =", state_2);

			tray.pollForDisc();

		});
	});
});







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


function setProjectInfo(initialState) { 
	return new Promise(function(resolve, reject) {
		var state = initialState;

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


