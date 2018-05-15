# massdrop-job-queue
A job queue that takes in URLs and returns their HTML content (response body), implemented through a job queue built on kue. 

The project is built on node.js and Express, with mongoDB as its database. As mentioned prior, the job queue is implemented using kue on top of redis.

## Dependencies
The application requires that you have mongoDB and redis installed. The application itself runs on port 3000 on your localhost, and redis and mongoDB must be running for the application to work correctly.

Node modules should be installed with `npm install`. The application makes use of several node modules, including but not limited to mongoose, kue, ejs, and others. The html templates are scripted in EJS. In a more sophisticated environment, a more modularized UI could be written in React or Angular.
The application itself should be run with `npm start`.

## REST API
The application exposes all of kue's built-in JSON API from `/api/kue`.

In addition, the application exposes an API accessing both its internal kue queue and information from its mongoDB database, described as follows:

### GET /api
Returns all jobs from the database, both completed and incomplete. Information exposed by the response includes kue's assigned job ID, the associated URL accessed by this job, the current status (enumerated as inactive, failure, or complete), and the HTML result body of the HTTP request, if the job is completed.

### GET /api/:jobid
Returns the information pertaining to the job in the database with jobid specified.

### GET /api/:jobid/status
Returns the status field of the job in the database with the jobid specified.

### GET /api/:jobid/result
Returns the HTML result body of the HTTP request performed by the jobid specified. If the job has not yet been processed, the result field is empty.

### POST /api
A URL must be specified in the POST request via JSON (specified in the Content-Header), under the field "url". Given the provided URL in the request body, a job is created on the kue queue corresponding to the URL.

PUT and DELETE are not implemented, but potentially could be if the project were further developed.

## UI Implementation
The UI implementation is somewhat rudimentary, and serves to demonstrate a graphical endpoint demonstrating the database and kue job queue. 
Some unexpected behavior may occur due to the asynchronicity of the calls presented in index.js. In particular, when adding a new job via the UI, it will most likely not appear on the UI. This is because the call to add a job to the queue returns with a delay.

## Testing
The application was tested using Postman (for the API) and monitored through the browser and kue-UI (accessible via `/api/kue`).
Error handling is not very sophisticated, and would need to be handled better in a production environment. For the most part, logging accounts for error handling in the current code.