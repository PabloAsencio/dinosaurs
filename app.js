// The whole code is enclosed in an IIFE so that we can declare it
// as async and use await to load the json file.
(async function () {
    // Create Dino Constructor

    // Create Dino Objects
    async function loadDinos() {
        const dinos = await fetch('/dino.json')
            .then((response) => response.json())
            .then((data) => data['Dinos'])
            .catch((error) => {
                document.getElementById('error--load').textContent =
                    'There was a problem while loading the data. Please refresh the page!';
            });
        return dinos;
    }

    const dinos = await loadDinos();

    // Create Dino Constructor

    // Create Dino Objects

    // Create Human Object

    // Use IIFE to get human data from form

    // Create Dino Compare Method 1
    // NOTE: Weight in JSON file is in lbs, height in inches.

    // Create Dino Compare Method 2
    // NOTE: Weight in JSON file is in lbs, height in inches.

    // Create Dino Compare Method 3
    // NOTE: Weight in JSON file is in lbs, height in inches.

    // Generate Tiles for each Dino in Array

    // Add tiles to DOM

    // Remove form from screen

    // On button click, prepare and display infographic
})();
