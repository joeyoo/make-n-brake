var APP = {
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
		directoryName: ''
	},
	start: function() {
		APP.setProjectInfo
		.then(function(successInfo) {
			APP.createOrFindProjectDir
			.then(function(success) {
				tray.pollForDisc();
				// check for disc
				 // if no disc, eject
				 // if disc, ask if correct disc
				 	// if correct disc, ask for disc number
				 	// if incorrect disc, eject
			});

		});
	},
	stop: function() {
		CLI.close();
	}
}
	start: function() {
		// run CLI
		
		// prompt user for project info
		promptProjectInfo();
		// check for disc
			// if no disc, prompt user to type 'eject'
			// if disc, prompt user to type disc number or eject if wrong disc
		APP.setProjectInfo
		.then(function(successInfo) {
			APP.createOrFindProjectDir
			.then(function(success) {
				tray.pollForDisc();
			});

		});
	},
	stop: function() {
		CLI.close();
	}