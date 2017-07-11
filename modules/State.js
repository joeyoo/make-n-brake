function State(store, emitter) {
	this.store = store;
	this.emitter = new emitter();

	this.emitter.on('state', function(updatedStore) {
		this.store = updatedStore;
	});

}

module.exports = State;