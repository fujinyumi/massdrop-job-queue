var kue = require('kue');
var request = require('request');

var server = require('../server/server.js');
var db = server.getServer();

const CONCURRENT_JOBS = 10;

var queue = kue.createQueue();

queue.watchStuckJobs();

module.exports = {
	queueJob: function(data, callback) {
		let job = queue.create('saveURL', {url: data});
		job.save(err => {if(err) callback(err); 
					  else {
						  //add new job to mongoDB
						  server.createJob(callback, +job.id, data, 'inactive');
					  }
					})
			.on('complete', function(result){
				server.updateJob({id: +job.id}, {status: 'complete'}, function(err) {
					if(err) console.log("Error updating job");
				});
				console.log('Job completed');
			}).on('failed', function(errorMessage){
				console.log("update from failed");
				server.updateJob({id: +job.id}, {status: 'failed'}, function(err) {
				if(err) console.log("Error updating job");
				});
			console.log('Job failed');
			});
	},

	processJobs: function() {
		queue.process('saveURL', CONCURRENT_JOBS, function(job, done) {
			//retrieve HTML content
			request(job.data.url, (error, response, body) => {
				if(error) { console.log(error); job.failed().error(error); done(error); }
				else if(body) {
					server.updateJob({id: +job.id}, { $set: {result: body}}, function(err) {
						if(err) console.log("Error updating job");
					});
				}
				done();
			});
		});
	}
}