// Path to the text file containing our NASA API key
const API_KEY_PATH = 'NASA-api-key.txt';

// General file-loading function (used to load API key)
// Source: https://stackoverflow.com/a/41133213
function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  } else {
    console.log(Error(`Failed to load file '${filePath}': ${xmlhttp.status} ${xmlhttp.statusText}`));
  }
  return result;
}

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Disable search button until API key is verified
document.getElementById('fetch').disabled = true;

// Load the API key from the text file and store it in a variable
const API_KEY = loadFile(API_KEY_PATH);

// Check if the API key was loaded successfully
if (API_KEY == null) {
  document.querySelector('.api-status').textContent = 'Failed to load API key. Please try again.';
  document.querySelector('.api-status').style.backgroundColor = 'red'; /* TODO: Find good shade of red */
  throw new Error(`Could not get API key from text file. Please make sure the file exists and contains your NASA API key.`);
} else {
  console.log('API key loaded successfully.');
}

// Verify API key
fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
  .then(response => {
    if (!response.ok) {
      /* TODO: differentiate between invalid API key, rate limit, etc. */
      document.querySelector('.api-status').textContent = 'API key verification failed. Please contact the developer.';
      document.querySelector('.api-status').style.backgroundColor = 'red'; /* TODO: Find good shade of red */
      throw new Error(`API key verification failed: ${response.status} ${response.statusText}`);
    } else {
      document.querySelector('.api-status').textContent = 'Connected to NASA APOD API!';
      document.querySelector('.api-status').style.backgroundColor = 'green'; /* TODO: Find good shade of green */
      document.getElementById('fetch').disabled = false;
      console.log('API key verified successfully.');
    }
  });

