// ======== CONSTANTS AND HELPER FUNCTIONS ========
// Path to the text file containing our NASA API key
const API_KEY_PATH = 'NASA-api-key.txt';

// Fun space facts
const SPACE_FACTS_TITLES = ["Space is completely silent.", "A day on Venus is longer than its year.", "Neutron stars are insanely dense", "The hottest planet isn’t Mercury", "There may be a planet made of diamonds", "You can’t cry normally in space", "The Sun contains almost all the Solar System’s mass", "There’s a giant cloud of alcohol in space", "Saturn could float in water (technically)", "The Milky Way is speeding through space"];
const SPACE_FACTS = ["Sound needs air (or some medium) to travel, and space is basically a vacuum.", "Venus rotates so slowly that it takes longer to spin once than to orbit the Sun.", "A sugar-cube-sized chunk of a neutron star would weigh about a billion tons on Earth.", "Even though Mercury is closest to the Sun, Venus is hotter because its thick atmosphere traps heat.", "A planet called '55 Cancri e' might be loaded with carbon and could have diamond-like terrain.", "Tears don’t fall—they just form floating blobs on your face.", "About 99.8% of the mass in the Solar System is in the Sun.", "A massive cloud of ethyl alcohol exists in space—enough to make trillions of trillions of drinks.", "Saturn’s average density is less than water, so in a ridiculously huge bathtub, it would float.", "Our galaxy is moving at about 1.3 million miles per hour (2.1 million km/h)."];

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

// Convert a date from YYYY-MM-DD format to a more verbose format (e.g. "January 1, 2000")
function verboseDate(date) {
  const dateElems = date.split('-');
  const verboseMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return `${verboseMonths[parseInt(dateElems[1]) - 1]} ${dateElems[2]}, ${dateElems[0]}`;
}

// ============== MAIN FUNCTIONALITY ==============
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
  document.querySelector('.space-fact')?.remove(); // Remove existing fun fact

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

  // Display a fun space fact above the gallery
  const factIndex = Math.floor(Math.random() * SPACE_FACTS.length);
  const spaceFactDiv = document.createElement('div');
  spaceFactDiv.classList.add('space-fact');
  spaceFactDiv.innerHTML = `
    <h3>Did you know: ${SPACE_FACTS_TITLES[factIndex]}</h3>
    <p>${SPACE_FACTS[factIndex]}</p>
  `;
  document.querySelector('.container').insertBefore(spaceFactDiv, gallery);

  // Create a gallery-item element for each image in data
  data.forEach(element => {
    const galleryItem = document.createElement('div');
    galleryItem.classList.add('gallery-item');

    const img = document.createElement('img');
    img.src = element.url;
    galleryItem.appendChild(img);

    const title = document.createElement('p');
    title.classList.add('title');
    title.textContent = element.title;
    title.addEventListener('click', () => showModal(element));
    galleryItem.appendChild(title);

    const date = document.createElement('p');
    date.textContent = verboseDate(element.date);
    galleryItem.appendChild(date);

    gallery.appendChild(galleryItem);
  });
}

// ======= MODAL WINDOW LOGIC (AI-GENERATED) =======

// Create and show a modal window with more details about the gallery item
function showModal(element) {
  // Create an overlay to darken the background and center the modal
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = 1000;

  // Create the modal window itself
  const modal = document.createElement('div');
  modal.classList.add('modal-window');
  modal.style.background = '#fff';
  modal.style.padding = '20px';
  modal.style.borderRadius = '8px';
  modal.style.maxWidth = '90vw';
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';

  // Add content to the modal (image, title, description, etc.)
  modal.innerHTML = `
    <img src="${element.hdurl}" alt="${element.title}" style="max-width:100%; border-radius:6px;">
    <h2>${element.title}</h2>
    <p><strong>Date:</strong> ${verboseDate(element.date)}</p>
    <p>${element.explanation || 'No description available.'}</p>
    <button id="close-modal">Close</button>
  `;

  // Close button
  modal.querySelector('#close-modal').onclick = () => document.body.removeChild(overlay);

  // Close when clicking outside the modal
  overlay.onclick = (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}