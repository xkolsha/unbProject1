// function to add the navbar to the page and make it responsive
fetch("navbar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar").innerHTML = data;

    const burger = document.querySelector(".navbar-burger");
    const menu = document.querySelector("#" + burger.dataset.target);

    burger.addEventListener("click", () => {
      burger.classList.toggle("is-active");
      menu.classList.toggle("is-active");
    });
  });

// function to add the footer to the page
fetch("footer.html")
  .then((response) => response.text())
  .then((data) => (document.getElementById("footer").innerHTML = data));

// ColorAPI base URL
const colorApiUrl = "https://www.thecolorapi.com/id?hex=";

const alphanumeric = "0123456789ABCDEF";

// Function to generate a random hex color
// For example: #534C8A = Victoria. We randomly select the index 5, 3, 4, 12, 8, 9 from the alphanumeric string
function getRandomHexColor() {
  let color = "";
  for (let i = 0; i < 6; i++) {
    color += alphanumeric[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Calculate the brightness of the background color to determine if it's light or dark
// #RRGGBB (e.g., #534C8A) represents RGB color; each 2-digit hex like 53, 4c, or 8a converts to decimal via (16 * 1st digit + 1 * 2nd digit), with a maximum value of 255 (FF)
function calculateBrightness(hexColor) {
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);
  const brightness = Math.round((r * 212.6 + g * 715.2 + b * 72.2) / 1000);
  return brightness;
}
// Function to fetch color data from ColorAPI and update the cards
async function updateColorData(hexColor) {
  try {
    // Fetch color data from ColorAPI
    const response = await fetch(colorApiUrl + hexColor + "&format=json");
    const data = await response.json();

    // Extract color values from the response
    const rgb = data.rgb.value;
    const hex = data.hex.value;
    const hsv = data.hsv.value;
    const cmyk = data.cmyk.value;
    const hsl = data.hsl.value;
    const imageNamed = data.name.value;

    // Check if the current page is "color.html" before updating the elements
    if (window.location.pathname.endsWith("color.html")) {
      document.getElementById("rgb-value").textContent = rgb;
      document.getElementById("hex-value").textContent = hex;
      document.getElementById("hsv-value").textContent = hsv;
      document.getElementById("cmyk-value").textContent = cmyk;
      document.getElementById("hsl-value").textContent = hsl;
      document.getElementById("color-name").textContent = imageNamed;

      // Clear the existing QR image if any
      const qrElement = document.getElementById("qr");
      qrElement.innerHTML = "";

      // Create a new QR image element
      const qrImg = document.createElement("img");
      qrImg.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=" +
        encodeURIComponent(document.URL) +
        "&color=" +
        hex.substring(1) +
        "&format=svg";
      qrElement.appendChild(qrImg);
    }
  } catch (error) {
    console.error("Error updating color data:", error);
  }
}

// If the background color is light, make the text color black; otherwise, make it white
function setTextBrightness(card, hexColor) {
  const brightness = calculateBrightness(hexColor);
  if (brightness > 125) {
    card.style.color = "black";
  } else {
    card.style.color = "white";
  }
}

// For each card, set its background color to a random color and update the textn
function setColorForRandomFill() {
  const cards = document.querySelectorAll(".randomFill");
  cards.forEach(function (card) {
    const randomColor = getRandomHexColor();
    card.style.backgroundColor = "#" + randomColor;
    card.style.cursor = "pointer";
    card.textContent = "#" + randomColor;
    setTextBrightness(card, randomColor);
    card.onclick = function () {
      window.open("color.html?color=" + randomColor, "_self");
    };
  });
}

// Function to fetch scheme data from ColorAPI and update the cards
async function updateSchemeData(hexColor) {
  try {
    const schemeModes = [
      "monochrome",
      "monochrome-dark",
      "monochrome-light",
      "analogic",
      "complement",
      "analogic-complement",
      "triad",
      "quad",
    ];

    // Iterate over each scheme mode
    for (const mode of schemeModes) {
      const response = await fetch(
        `https://www.thecolorapi.com/scheme?hex=${hexColor}&mode=${mode}&count=5`
      );
      const data = await response.json();
      const colors = data.colors.map((color) => color.hex.value);

      // Updated so this would only pull on color.html page as it was erroring on index.html
      if (window.location.pathname.endsWith("color.html")) {
        // Update the cards with the extracted values
        for (let i = 1; i <= 5; i++) {
          const card = document.getElementById(`${mode}-color-${i}`);
          card.style.backgroundColor = colors[i - 1];
          card.textContent = colors[i - 1];
          setTextBrightness(card, colors[i - 1]);
        }
      }
    }
  } catch (error) {
    console.error("Error updating scheme data:", error);
  }
}

// Function to convert an RGB value to HEX
function rgbToHex(rgb) {
  // Remove parentheses from the input, if any
  rgb = rgb.replace(/[()]/g, "");

  let rgbValues = rgb.split(",");
  let hex = "";
  for (let i = 0; i < 3; i++) {
    let hexComponent = parseInt(rgbValues[i]).toString(16);
    if (hexComponent.length === 1) {
      hex += "0" + hexComponent;
    } else {
      hex += hexComponent;
    }
  }
  return hex;
}

// Call the functions to update the color data, generate random colors, and update the scheme data
// Get the color from the URL
const urlParams = new URLSearchParams(window.location.search);
const color = urlParams.get("color");

if (color) {
  // If a color was specified, use it
  updateColorData(color);
  updateSchemeData(color);
} else {
  // Otherwise, generate a random color
  const randomColor = getRandomHexColor();
  updateColorData(randomColor);
  updateSchemeData(randomColor);
}

setColorForRandomFill();

if (window.location.pathname.endsWith("index.html")) {
  document
    .getElementById("generate-btn")
    .addEventListener("click", function () {
      let inputColor = document.getElementById("color-input").value;

      // Check if input is RGB or HEX
      if (inputColor.includes(",")) {
        // If it's RGB, convert it to HEX
        inputColor = rgbToHex(inputColor);
      }

      if (inputColor) {
        localStorage.setItem("color", inputColor);
        window.location.href = "color.html?color=" + inputColor;
      } else {
        localStorage.removeItem("color");
        window.location.href = "color.html";
      }
    });
}

// Call this function to update the last searched colors display
function updateLastColorsDisplay() {
  // Get the colors from local storage
  const lastColors = JSON.parse(localStorage.getItem("lastColors")) || [];

  // Update the display
  for (let i = 0; i < 5; i++) {
    const colorDisplay = document.getElementById(`last-color-display-${i + 1}`);
    if (lastColors[i]) {
      colorDisplay.style.backgroundColor = "#" + lastColors[i];
      colorDisplay.textContent = "#" + lastColors[i];
      colorDisplay.style.cursor = "pointer";
      setTextBrightness(colorDisplay, lastColors[i]);

      // Add click event listener
      colorDisplay.onclick = function () {
        // Redirect to color.html with color parameter
        window.location.href = "color.html?color=" + lastColors[i];
      };
    } else {
      colorDisplay.style.backgroundColor = "#FFFFFF";
      colorDisplay.textContent = "";
    }
  }
}

if (window.location.pathname.endsWith("index.html")) {
  document
    .getElementById("generate-btn")
    .addEventListener("click", function () {
      let inputColor = document.getElementById("color-input").value;

      // Check if input is RGB or HEX
      if (inputColor.includes(",")) {
        // If it's RGB, convert it to HEX
        inputColor = rgbToHex(inputColor);
      }

      if (inputColor) {
        // Save the color to local storage
        let lastColors = JSON.parse(localStorage.getItem("lastColors")) || [];
        lastColors.unshift(inputColor);
        if (lastColors.length > 5) {
          lastColors = lastColors.slice(0, 5);
        }
        localStorage.setItem("lastColors", JSON.stringify(lastColors));

        window.location.href = "color.html?color=" + inputColor;
      } else {
        localStorage.removeItem("color");
        window.location.href = "color.html";
      }

      // Update the last searched colors display
      updateLastColorsDisplay();
    });
}
if (window.location.pathname.endsWith("index.html")) {
  document
window.onload = function () {
  updateLastColorsDisplay();
};
};

//TODO - Add the ability to pull the dominant color from an image
// // Function to convert an RGB value to HEX
// if (window.location.pathname.endsWith("index.html")) {
//   document
//     .getElementById("generate-btn")
//     .addEventListener("click", function () {
//       // get url from the image input
//       var imageUrl = document.getElementById("imageInput").value;

//       // Create a new Image object and set properties
//       var image = new Image();
//       image.crossOrigin = "Anonymous"; // allows us to load images from different domains
//       image.src = imageUrl; // set the source of the image

//       // Event handler that runs when the image has finished loading
//       image.onload = function () {
//         //creates a canvas element with the same dimensions as the loaded image
//         var canvas = document.createElement("canvas");
//         canvas.width = image.width;
//         canvas.height = image.height;

//         // gets the 2d rendering context for the canvas
//         var context = canvas.getContext("2d");
//         context.drawImage(image, 0, 0); // draw the loaded image onto the canvs

//         // gets the pixel data of the canvas image
//         var imageData = context.getImageData(
//           0,
//           0,
//           canvas.width,
//           canvas.height
//         ).data;

//         //create an object to keep track of the amount of colors
//         var colorData = {};

//         // goes over generated pixel data to get the Rbg values
//         for (var i = 0; i < imageData.length; i += 4) {
//           var r = imageData[i]; // red
//           var g = imageData[i + 1]; // green
//           var b = imageData[i + 2]; // blue

//           var rbg = r + "," + g + "," + b;

//           // update the color count in (colorData)
//           if (colorData[rbg]) {
//             colorData[rbg]++;
//           } else {
//             colorData[rbg] = 1;
//           }
//         }

//         // find the primary color based on the highest colorData count
//         var primaryColor = Object.keys(colorData).reduce(function (a, b) {
//           return colorData[a] > colorData[b] ? a : b;
//         });

//         var urlHex = rbgToHex(primaryColor);

//         // This will be the output for the generated color from the image to work with the color api
//         document.getElementById("colorOutput").style.backgroundColor =
//           "rbg(" + primaryColor + ")"; // is not needed if we generate a palette through colorapi
//         document.getElementById("colorOutput").textContent =
//           "Primary Color: " + primaryColor;

//         // Need to find out how to run this through color api.
//         var hexCodeUrl =
//           "https://www.thecolorapi.com/scheme?hex=${urlHex}&mode=${mode}&count=5";
//         console.log("url hex code", hexCodeUrl);
//       };

//       //on error message incase the image can not load. (from line 176)
//       image.onerror = function () {
//         document.getElementById("colorOutput").textContent =
//           "Error loading image.";
//       };
//     });
// }
