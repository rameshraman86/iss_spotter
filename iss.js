/*
STEPs:
* Fetch our IP Address
* Fetch the geo coordinates (Latitude & Longitude) for our IP
* Fetch the next ISS flyovers for our geo coordinates
*/


// * FETCH IP ADDRESS

//this function will fetch and return an ip address from an API ansynchronously
//inpt is api link.. output is either error or the ip address itself.. 
// output gotten asynchronously will be passed onto a callback function.
//will use ansynch method 'http request' to talk to the API link

const request = require('request');

const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {

    if (error) {
      return callback(error, null);
    }

    //if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const ip = JSON.parse(body)["ip"];
    callback(null, ip);
  });
};


const fetchCoordsByIP = function(ip, callback) {
  request(`https://ipwho.is/${ip}`, (error, response, body) => {
    if (error) {
      return callback(error, null);
    }
    if (!JSON.parse(body)["success"]) {
      const message = `Success status was ${JSON.parse(body).success}. Server message says: ${JSON.parse(body).message} when fetching for IP ${JSON.parse(body).ip}`;
      return callback(Error(message), null);
    }
    
    if (JSON.parse(body)["success"]) {
      return callback(null, { latitude: JSON.parse(body)["latitude"], longitude: JSON.parse(body)["longitude"] });
    }
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    //successfull return
    const returnData = JSON.parse(body);
    callback(null, returnData.response);
    return;
  });
};


const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) { return callback(error, null); }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};


module.exports = { nextISSTimesForMyLocation };