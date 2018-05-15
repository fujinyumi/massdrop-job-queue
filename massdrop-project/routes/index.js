var express = require('express');
var queue = require('../queue/queue.js');
var server = require('../server/server.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	var htmlinfo = '';
	
	//note: because of async there is no guarantee the job will appear immediately after submitting this parameter
	if(req.query.urlpath) {
		//add job to queue
		queue.queueJob(req.query.urlpath, function(err) {
			if(err) {
				console.log("There was an error queueing your job.");
			}
		});
	}
	server.findJobs({}, null, function(err, result) {
		if(err) {
			console.log("There was an error accessing the database.")
		}
		if(req.query.checkstatus) {
			//check provided job ID's status, and return the html if it is complete
			server.findJob({id: +req.query.checkstatus}, null, function(err, resu) {
				if(err) console.log("There was an error identifying that job.");
				else if(resu)
				{
					if(resu.status == 'complete') {
						htmlinfo = resu.result;
					}
					else {
						htmlinfo = "This job's status is " + resu.status;
					}
					res.render('index', { jobs: result, htmlContent: htmlinfo });
				}
			});
		}
		else res.render('index', { jobs: result, htmlContent: htmlinfo });
	});

});

module.exports = router;
