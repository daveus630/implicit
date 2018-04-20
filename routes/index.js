var express = require('express');
var router = express.Router();

var uuid = require('node-uuid');
var request = require('request');

//var SEVER_URL = 'http://localhost:7000';
//var REDIRECT_SERVER_URL = 'http://localhost:5000';

var SEVER_URL = 'https://b2be6767.ngrok.io';
var REDIRECT_SERVER_URL = 'https://018f4a3e.ngrok.io';

var CLIENT_ID = '';

/* GET home page. */
router.get('/authorize', function(req, res) {
  var state = uuid.v4();
  req.session.state = state;
  CLIENT_ID = req.query.client_id; console.log("client Id = "+CLIENT_ID);
  var options = {
    url: SEVER_URL + '/authorize',
    redirect_uri: REDIRECT_SERVER_URL + '/callback',
	//redirect_uri: 'https://developers.google.com/oauthplayground',
    client_id: CLIENT_ID,
    state: state,
    response_type: 'token'
  };

  var authorizationURL = options.url +
    '?redirect_uri=' + options.redirect_uri +
    //'&user_id=' + options.user_id +
    '&client_id=' + options.client_id +
    '&response_type=' + options.response_type +
    '&state=' + options.state;

  res.render('index', {
    authorizationURL: authorizationURL
  });
});

/* GET the redirect's callback */
router.get('/callback', function(req, res, next) { console.log("callback func...");
  var state = req.query.state;
  var code = req.query.code;

  // Compare the state with the session's state
  if (state !== req.session.state) {
    next(new Error('State does not match'));
  }

  request.post({
    url: SEVER_URL + '/token',
    form: {
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_SERVER_URL + '/callback',
	  //redirect_uri:'https://developers.google.com/oauthplayground',
      client_id: CLIENT_ID
    }}, function(error, response, body) { console.log("token func...");
    if (error) {
      console.error('request failed', error);
    }

    var resp = JSON.parse(body);
    var accessToken = resp.access_token;
	//var redirect = 'https://developers.google.com/oauthplayground/#access_token='+accessToken+'&token_type='+resp.token_type+'&expires_in='+resp.expires_in;
	var redirect = resp.redirect_uri+'/#access_token='+accessToken+'&token_type='+resp.token_type;
    // Use the Access Token for a protected resource request
    //res.send('Access Token: ' + accessToken);
	//res.send(accessToken);
	res.redirect(redirect);
  });
});

module.exports = router;
