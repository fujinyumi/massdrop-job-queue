var mongoose = require('mongoose');

//set up connection to our db
var db;
//schema to use
var jobSchema;
//model to use
var Job;

module.exports = {

		//use mongoose to connect to db instance
		connect: function(callback) {
			mongoose.connect('mongodb://localhost/massdrop');
			db = mongoose.connection;
			db.on('error', console.error.bind(console, 'connection error:'));
			db.once('open', function() {
				//establish schema
				jobSchema = new mongoose.Schema({
					id: Number,
					url: String,
					status: String,
					result: String
				});
				
				Job = mongoose.model('Job', jobSchema);
				
				callback();
			});
		},
		
		//create job
		createJob: function(callback, id, url, status) {
			var newJob = new Job({id: id, url: url, status: status, result:''}).save(function(err) {
			if(err) { console.log("There was an error creating a job in the model."); callback(err); }
			});
		},
		
		//update job
		updateJob: function(condition, modifier, callback) {
			Job.update(condition, modifier, null, callback);
		},
		
		//find job
		findJob: function(condition, projection, callback) {
			if(projection != null)
				Job.findOne(condition, projection, callback);
			else Job.findOne(condition, callback);
		},
		
		//find multiple jobs
		findJobs: function(condition, projection, callback) {
			if(projection != null)
				Job.find(condition, projection, callback);
			else Job.find(condition, callback);
		},
		
		//return model
		getModel: function() {
			return Job;
		},
		
		//return db instance
		getServer: function() {
			return db;
		}
}
