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
  document.querySelector('.api-status').style.backgroundColor = 'rgba(255, 87, 59, 0.82)';
  throw new Error(`Could not get API key from text file. Please make sure the file exists and contains your NASA API key.`);
} else {
  console.log('API key loaded successfully.');
}

// Verify API key
fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
  .then(response => {
    if (!response.ok) {
      /* TODO: differentiate between invalid API key (403), rate limit (429), etc. */
      document.querySelector('.api-status').textContent = 'API key verification failed. Please contact the developer.';
      document.querySelector('.api-status').style.backgroundColor = 'rgba(255, 87, 59, 0.82)';
      throw new Error(`API key verification failed: ${response.status} ${response.statusText}`);
    } else {
      document.querySelector('.api-status').textContent = 'Connected to NASA APOD API!';
      document.querySelector('.api-status').style.backgroundColor = 'rgba(23, 227, 23, 0.86)';
      document.getElementById('fetch').disabled = false;
      console.log('API key verified successfully.');
    }
  });

// Fetch and display images on "Get Space Images" button click
document.getElementById('fetch').addEventListener('click', () => {
  document.getElementById('fetch').disabled = true; // Disable button to prevent multiple clicks
  document.getElementById('gallery').innerHTML = ''; // Clear gallery/placeholder content

  // Show loading message while fetching images
  const waitDiv = document.createElement('div');
  waitDiv.classList.add('placeholder');
  waitDiv.innerHTML = `
    <div class="placeholder-icon">⏳</div>
    <p id="fetch-status">Loading space photos...</p>
  `;
  document.getElementById('gallery').appendChild(waitDiv);

  // Get the selected date range from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;
  console.log(`Fetching images from ${startDate} to ${endDate}...`);

  // Fetch images from the NASA APOD API for the selected date range
  fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Data fetched successfully:', data)
      displayImages(data); // Call function to display images in the gallery

      document.getElementById('fetch').disabled = false; // Enable button after fetching images
    })
    .catch(error => {
      // TODO show error to client
      console.log(Error('Error fetching images:', error));
    });
 }
);

// Display fetched images in the gallery
function displayImages(data) {
  // Clear the gallery
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  // Create a gallery-item element for each image in data
  data.forEach(element => {
    const galleryItem = document.createElement('div');
    galleryItem.classList.add('gallery-item');

    const img = document.createElement('img');
    img.src = element.url;
    galleryItem.appendChild(img);

    const title = document.createElement('p');
    title.textContent = element.title;
    galleryItem.appendChild(title);

    const date = document.createElement('p');
    date.textContent = element.date;
    galleryItem.appendChild(date);

    gallery.appendChild(galleryItem);
  });
}