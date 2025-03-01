const generateForm = document.querySelector(".generate_form");
const generateBtn = generateForm.querySelector(".generate_btn");
const imageGallery = document.querySelector(".img_gallery");

const UNSPLASH_API_KEY = "hpMnMrZxA69RiAULxhPLz7DOQeI76v7-7Yygl1bqi9s"; // Ensure to keep this key secure, preferably in the backend
let isImageGenerating = false;

// Function to update the image cards with fetched image data
const updateImageCards = (images) => {
  images.forEach((img, index) => {
    const imgCard = imageGallery.querySelectorAll(".img_card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download_btn");

    // Set image source from Unsplash
    imgElement.src = img.urls.regular;

    // When the image has loaded, remove the loading state
    imgElement.onload = () => {
      imgCard.classList.remove("loading");

      // Handle download button click
      downloadBtn.addEventListener("click", async (e) => {
        e.preventDefault(); // Prevent default anchor behavior

        try {
          // Fetch the full-size image as a Blob
          const response = await fetch(img.urls.full);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);  // Create a Blob URL

          // Create a temporary download link
          const a = document.createElement("a");
          a.href = url;
          a.download = `${new Date().getTime()}.jpg`;  // Set filename as timestamp
          document.body.appendChild(a);  // Append to body for click triggering
          a.click();  // Trigger the download
          document.body.removeChild(a);  // Clean up the DOM

          // Clean up the Blob URL
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error downloading image:", error);
          alert("An error occurred while downloading the image.");
        }
      });
    };
  });
};

// Function to fetch images from Unsplash API
const fetchImagesFromUnsplash = async (query, quantity) => {
  try {
    // Fetch a random set of images based on user input
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_API_KEY}&count=${quantity}`);
    if (!response.ok) throw new Error("Failed to fetch images. Check the API key.");

    // Parse the response and update image cards
    const images = await response.json();
    updateImageCards(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    alert("An error occurred while fetching images.");
  } finally {
    // Re-enable the button after processing
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
};

// Handle form submission to trigger image generation
const handleImageGeneration = (e) => {
  e.preventDefault();

  if (isImageGenerating) return;  // Prevent generating images multiple times

  const userPrompt = e.target[0].value.trim();  // Get user input for prompt
  const userImgQuantity = parseInt(e.target[1].value, 10);  // Get number of images

  // Validate inputs
  if (!userPrompt || userImgQuantity <= 0) {
    alert("Please provide a valid search term and a positive number of images.");
    return;
  }

  // Disable button and show loading state
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating...";
  isImageGenerating = true;

  // Create loading state for image cards
  const loadingMarkup = Array.from({ length: userImgQuantity }, () => 
    `<div class="img_card loading">
      <img src="images/loader.svg" alt="Loading image..." />
      <a class="download_btn" href="#">
        <img src="images/download.svg" alt="Download icon" />
      </a>
    </div>`
  ).join("");

  imageGallery.innerHTML = loadingMarkup;  // Insert loading placeholders

  // Fetch images from Unsplash
  fetchImagesFromUnsplash(userPrompt, userImgQuantity);
};

// Attach event listener to the form to handle submission
generateForm.addEventListener("submit", handleImageGeneration);
