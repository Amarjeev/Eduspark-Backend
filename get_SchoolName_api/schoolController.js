//___________ 📝 Enter UDISE Code 🎯 View School Profile____________________

// Import necessary modules
const express = require("express");
const searchSchool = express.Router(); // Create a new router instance

// axios is used to send HTTP requests
const axios = require("axios");

// cheerio is used to parse and extract HTML content (like jQuery on the server)
const cheerio = require("cheerio");

// Define GET route for fetching school info by UDISE code
searchSchool.get("/search/schools/:code", async (req, res,next) => {
  const { code } = req.params; // Extract the UDISE code from the URL

  try {
    // Send a GET request to the external school details page
    const response = await axios.get(
      `https://stackschools.com/schools/${code}/`
    );

    // Load the HTML response into cheerio for parsing
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract the school name from the main content area
    const schoolName = $("#main_div h2").text().trim();

    // Extract the UDISE code from a span element with specific class
    const udisecode = $(".badge.bg-secondary").text().trim();

    // Send the extracted data as a JSON response
    res.send({ schoolName, udisecode });
  } catch (error) {
    next(error);
  }
});

// Export the router to use it in your main Express app
module.exports = searchSchool;
