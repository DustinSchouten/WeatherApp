import fetch from 'node-fetch';
import database from './database.js';
import DatabaseOperations from './databaseOperations.js';

export default class WeatherDataHandler {
   static API_KEY = process.env.API_KEY;
   static API_BASE_URL = process.env.API_BASE_URL;

   static async fetchData(city) {
      const URL = `${WeatherDataHandler.API_BASE_URL}?q=${city}&appid=${WeatherDataHandler.API_KEY}&units=metric&lang=nl`;
      try {
         return await fetch(URL);
      }
      catch {
         throw new Error('Er is iets misgegaan tijdens het ophalen van de data');
      }
   }

   static checkResponse(response) {
      if (response.status == 200) {
         return;
      }
      if (response.status == 404 && response.statusText == 'Not Found') {
         throw new Error('Voer een geldige stad in');
      }
      else {
         throw new Error('Onbekende fout');
      }
   }

   static async parseData(response) {
      // Get the response body
      const responseData = await response.json();

      // Collect all important values from the response
      const cityName = responseData['name'];
      let countryCode; // The countryCode and countryName are not always present in the response
      let countryName;
      try {
         countryCode = responseData['sys']['country'];
         countryName = new Intl.DisplayNames(['nl'], { type: 'region' }).of(countryCode);
         countryCode = countryCode.toLowerCase();
      }
      catch {}
      const temperature = Math.round(responseData['main']['temp']);
      const description = responseData['weather'][0]['description'];
      
      return {cityName, countryCode, countryName, temperature, description}
   }

   static async writeToDb(weatherData) {
      const modelInstance = database.models.CityTemperature.build(weatherData);
      await DatabaseOperations.insertIntoDb(modelInstance);
   }

   static async getFromDb() {
      const model = database.models.CityTemperature;
      return await DatabaseOperations.selectFromDb(model);
   }

   static async deleteFromDb(id) {
      const model = database.models.CityTemperature;
      await DatabaseOperations.deleteFromDb(model, id);
   }
 }