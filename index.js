import express from 'express';
import bodyParser from 'body-parser'; // For parsing incoming request body's
import { check, validationResult } from 'express-validator'; // For form validation
import moment from 'moment'; // For formatting datetime in EJS-template
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import WeatherDataHandler from './dataHandler.js';

const PORT = process.env.PORT;

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Routes
app.get('/', (req, res) => {
   res.status(200).render('index', {customCssFile: 'home.css'});
});

app.get('/city_input', (req, res) => {
   res.status(200).render('city_input', {csrfToken: req.csrfToken(), customCssFile: 'city_input.css', errorMessage: null});
});

const cityFormValidators = [check('city', 'De invoer mag niet leeg zijn').notEmpty()];

app.post('/city_input', cityFormValidators, async (req, res) => {
   const errors = validationResult(req);
   // Check the city input is empty
   if (!errors.isEmpty()) {
      const errorMessage = errors.errors[0].msg;
      return res.status(400).render('city_input', {csrfToken: req.csrfToken(), customCssFile: 'city_input.css', errorMessage: errorMessage});
   }

   const city = req.body.city;
   let response;

   // Check if there are errors occured while fetching the weather data.
   try {
      response = await WeatherDataHandler.fetchData(city);
      WeatherDataHandler.checkResponse(response);
   }
   catch (error) {
      const errorMessage = error.message.replace("Error: ", "");
      return res.status(400).render('city_input', {csrfToken: req.csrfToken(), customCssFile: 'city_input.css', errorMessage: errorMessage});
   }

   const weatherData = await WeatherDataHandler.parseData(response);
   await WeatherDataHandler.writeToDb(weatherData);

   res.redirect('/results');
});

app.get('/results', async (req, res) => {
   const weatherData = await WeatherDataHandler.getFromDb();
   res.status(200).render('results', {csrfToken: req.csrfToken(), customCssFile: 'results.css', weatherData: weatherData, moment});
});

app.post('/results', async (req, res) => { // When the user deletes one of the data entries
   const id = req.body.id;
   await WeatherDataHandler.deleteFromDb(id);
   const weatherData = await WeatherDataHandler.getFromDb();
   res.status(200).render('results', {customCssFile: 'results.css', weatherData: weatherData, moment});
});

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`)
});
