var express = require('express');
var kue = require('kue');
var request = require('request');
var server = require('../server/server.js');
var router = express.Router();

var queue = require('../queue/queue.js');

//expose kue built-in API
router.use('/kue', kue.app);

//I'll also define a API under the /api/ path that communicates with mongoDB

//GET /api
//Returns all documents in the job database, both completed and incomplete
router.get('/', function(req, res) {
	var jobid = +req.params.jobid;
	server.findJobs({}, null, function(err, result) {
		if(err) {
			console.log("There was an error connecting with the database.");
			res.status(500).send("Internal Server Error");
		}
		else {
			if(result) {
				res.status(200).json(result);
			}
			else res.status(404).send("Not found");
		}
	});
});

// GET /api/:jobid
// Displays info in our DB for the job with the corresponding job ID:
// Job ID, corresponding URL, current status, and result (empty if job hasn't been completed)
router.get('/:jobid', function(req, res) {
	var jobid = +req.params.jobid;
	server.findJob({id: jobid}, null, function(err, result) {
		if(err) {
			console.log("There was an error connecting with the database.");
			res.status(500).send("Internal Server Error");
		}
		else {
			if(result) {
				res.status(200).json({id: result.id, url: result.url, status: result.status, result: result.result });
			}
			else res.status(404).send("Not found");
		}
	});
});

// GET /api/:jobid/status
// Displays just the status of the job with the corresponding :jobid
router.get('/:jobid/status', function(req, res) {
	var jobid = +req.params.jobid;
	server.findJob({id: jobid}, 'status', function(err, result) {
		if(err) {
			console.log("There was an error connecting with the database.");
			res.status(500).send("Internal Server Error");
		}
		else {
			if(result) {
				res.status(200).json({status: result.status});
			}
			else res.status(404).send("Not found");
		}
	});
});

// GET /api/:jobid/result
// Displays just the result of the job with the corresponding :jobid. If the job has not yet been completed, the api returns 202 (Accepted)
router.get('/:jobid/result', function(req, res) {
	var jobid = +req.params.jobid;
	server.findJob({id: jobid}, 'result', function(err, result) {
		if(err) {
			console.log("There was an error connecting with the database.");
			res.status(500).send("Internal Server Error");
		}
		else {
			if(result) {
				res.status(200).json({result: result.result});
			}
			else res.status(404).send("Not found");
		}
	});
});

// POST /api
// Creates a job with the URL provided in the url field of the JSON body
router.post('/', function(req, res) {
	  //process json from req
	if(!req.headers['content-type'] || req.headers['content-type'].indexOf('application/json') != 0) {
	  res.status(400).send("Bad request").end();
	}
	else if(req.body.url === undefined) {
	  res.status(400).send("Bad request").end();
	}
	else {
		let myurl = req.body.url;
		queue.queueJob(myurl, function(err) {
		if(err) {
			console.log("There was an error queueing your job.");
		}
	});
		res.status(200).send("Success");
	}
});

//In this API, we could also have PUT and DELETE requests, to modify information about the jobs such as the URL, and to remove them before they're processed.
//I won't implement them, but they could be defined as follows:
// PUT /api/:jobid
// Changes the information of the job provided in :jobid to the information specified within this request's body, which must be of json type
// DELETE /api/:jobid
// Deletes the job with the corresponding job ID from the queue.

module.exports = router;