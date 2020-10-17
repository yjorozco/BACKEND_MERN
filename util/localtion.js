const API_KEY = 'AIzaSyBllWXU--n2KN9Aep8BYOGFeM4JzJsrvlE';
const axios= require('axios');
const HttpError = require('../models/http-error');

async function getGoordsForAddress(address){

   /* const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`)
    const data = response.data;
    if(!data || data.status === 'ZERO_RESULTS'){
        const error = new HttpError('Could not find a place for that id', 422);
        throw error;
    }

    const coordinates = data.results[0].geometry.location;
    return coordinates;*/

    return  { location: {
        lat:40.7484405,
        lng: -73.9856644}
    }
}

module.exports =  getGoordsForAddress;