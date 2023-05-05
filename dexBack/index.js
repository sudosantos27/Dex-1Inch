// Import required packages and modules
const express = require("express");  // Express framework for Node.js
const Moralis = require("moralis").default;  // Moralis SDK for interacting with the blockchain
const app = express();  // Create an instance of the Express app
const cors = require("cors");  // Middleware for enabling CORS (Cross-Origin Resource Sharing)
const { response } = require("express");  // Extract the response object from Express
require("dotenv").config();  // Load environment variables from the .env file
const port = 3002;  // Port number for running the server

/**
express: Express is a popular web framework for Node.js that simplifies the process of creating web applications. 
It provides a number of features for handling HTTP requests and responses, including routing, middleware, and view rendering.

Moralis: Moralis is a backend-as-a-service (BaaS) platform that provides a number of features for building decentralized 
applications. It includes support for interacting with the Ethereum blockchain, managing user authentication and authorization, 
and handling file storage.

app: This variable is an instance of the Express application, which is used to define the endpoints and middleware for the 
web application.

cors: CORS (Cross-Origin Resource Sharing) is a security feature built into web browsers that restricts web pages from making 
requests to a different domain than the one that served the page. The cors middleware is used to configure the server to allow 
requests from different origins.
 */

app.use(cors());
app.use(express.json());

/**
  app.use(cors());: This line of code sets up the cors middleware, which allows cross-origin resource sharing for our server. 
  CORS is a security feature implemented in web browsers that restricts web pages from making requests to a different domain 
  than the one that served the web page. By enabling CORS, we can allow our frontend application to make requests to our 
  backend server. cors is a third-party middleware package that is commonly used in Express applications to simplify the 
  configuration of CORS settings.

  app.use(express.json());: This line of code sets up the express.json() middleware, which parses incoming requests with JSON 
  payloads. The JSON data is then available in the req.body property. This middleware is used to handle POST and PUT requests 
  that have JSON payloads in the request body. It ensures that the data is parsed correctly and is available in a convenient 
  format for our application to use. By using this middleware, we don't have to manually parse the JSON data in each request 
  handler, which saves us time and effort.
 */


// This creates a GET route on the server at the endpoint "/tokenPrice". When a client sends a GET request to this endpoint, 
//the code inside the function will be executed.
app.get("/tokenPrice", async (req, res) => {

  // This destructures the query property from the req object, which contains any query parameters passed in the request.
  const {query} = req;

  // This uses the Moralis SDK to get the token price for the token with the address specified in the addressOne query parameter.
  const responseOne = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressOne
  })

  // This uses the Moralis SDK to get the token price for the token with the address specified in the addressTwo query parameter.
  const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressTwo
  })

  // This creates an object containing the USD price of tokenOne, the USD price of tokenTwo, and the ratio of tokenOne's price to tokenTwo's price.
  const usdPrices = {
    tokenOne: responseOne.raw.usdPrice,
    tokenTwo: responseTwo.raw.usdPrice,
    ratio: responseOne.raw.usdPrice/responseTwo.raw.usdPrice
  }

  // This sends a JSON response to the client with the status code 200 (OK) and the usdPrices object as the response body.
  return res.status(200).json(usdPrices);
});


/**
  This code starts the Moralis server and sets it up to listen for API calls on a specific port. The Moralis.start() method 
  takes an object with an apiKey property that contains the Moralis API key. This key is used to authenticate and authorize 
  the app to access the Moralis server.

Once the server has started, the app.listen() method is called with the port number as the argument, which starts the server 
and listens for incoming requests on that port. When the server is successfully started, the console.log() method is called 
to log a message indicating that the server is listening for API calls.
 */
Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
