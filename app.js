// The whole code is enclosed in an IIFE so that we can declare it
// as async and use await to load the json file.
(async function () {
    // *** FUNCTION DECLARATIONS ***
    // --- Helper functions ---
    // Rounds a float to a number with one decimal place
    function roundToOneDecimalPlace(number) {
        // We use Number.EPSILON to make sure that numbers like 1.05 round correctly
        // See https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
        return Math.round((number + Number.EPSILON) * 10) / 10;
    }

    // It returns true if the word passed as an argument
    // starts with a vowel
    function startsWithVowel(name) {
        return /^[AEIOUaeiou]/.test(name);
    }

    // It returns the correct indefinite article (a/an) for a noun.
    // Note that it is a naive implementation that works fine
    // for the given subset of words, but will not provide
    // correct results for a bigger set.
    function getArticle(name, isLowerCase = true) {
        return `${isLowerCase ? 'a' : 'A'}${startsWithVowel(name) ? 'n' : ''}`;
    }

    // It returns true if the user input is a number greater than zero
    function validateUserInput(number) {
        return !isNaN(number) && number > 0;
    }

    // --- Factory functions ---
    // Get human data from the form
    function makeHuman() {
        return {
            name: document.getElementById('name').value,
            weight: document.getElementById('weight').value,
            height:
                Number.parseInt(document.getElementById('feet').value) * 12 +
                Number.parseInt(document.getElementById('inches').value),
            diet: document.getElementById('diet').value,
            image: './images/human.png',
        };
    }

    // Returns a function that lets us compare the weight of the human
    // passed as an argument to that of a dinosaur.
    // NOTE: Weight in JSON file is in lbs.
    // We will generate the final compare methods once the data for
    // the human object is known. That's why at this point we can only
    // write higher order functions that will be used to generate those
    // methods.
    function createWeightComparator(human) {
        return function (dino) {
            let result = '';
            if (Math.abs(dino.weight - human.weight) < 10) {
                result = `You are about as heavy as ${getArticle(
                    dino.species
                )} ${dino.species}.`;
            } else if (dino.weight > human.weight) {
                result = `${getArticle(dino.species, false)} ${
                    dino.species
                } was about ${roundToOneDecimalPlace(
                    dino.weight / human.weight
                )} times as heavy as you.`;
            } else {
                result = `You are about ${roundToOneDecimalPlace(
                    human.weight / dino.weight
                )} times as heavy as ${getArticle(dino.species)} ${
                    dino.species
                }`;
            }
            return result;
        };
    }

    // Returns a function that lets us compare the height of the human
    // passed as an argument to that of a dinosaur.
    // NOTE: Height in JSON file is in inches.
    function createHeightComparator(human) {
        return function (dino) {
            let result = '';

            if (Math.abs(dino.height - human.height) < 1) {
                result = `You are about as tall as ${getArticle(
                    dino.species
                )} ${dino.species}.`;
            } else if (dino.height > human.height) {
                result = `${getArticle(dino.species, false)} ${
                    dino.species
                } was about ${roundToOneDecimalPlace(
                    dino.height / human.height
                )} times taller than you.`;
            } else {
                result = `You are about ${roundToOneDecimalPlace(
                    human.height / dino.height
                )} times taller than ${getArticle(dino.species)} ${
                    dino.species
                }`;
            }

            return result;
        };
    }

    // Returns a function that lets us compare the diet of the human
    // passed as an argument to that of a dinosaur.
    function createDietComparator(human) {
        return function (dino) {
            let result = '';
            if (human.diet.toLowerCase() == dino.diet.toLowerCase()) {
                result = `Both you and ${getArticle(dino.species)} ${
                    dino.species
                } are ${dino.diet.toLowerCase()}s`;
            } else {
                result = `You are ${getArticle(
                    human.diet
                )} ${human.diet.toLowerCase()}, whereas ${getArticle(
                    dino.species
                )} ${dino.species} was ${getArticle(
                    dino.diet
                )} ${dino.diet.toLowerCase()}.`;
            }
            return result;
        };
    }

    // Create Dino Constructor
    // comparators is an object that contains several methods to compare a
    // dinosaur to a particular human being
    function makeDino(dinoData, comparators) {
        // This function returns a fact about the dinosaur.
        // According to the specification this fact must always be the same
        // for the pigeon, whereas for the other species it must be a random
        // fact from a selection of six or more facts, including the comparisons
        // to the human.
        function getFact() {
            let result = '';
            if (_species == 'Pigeon') {
                result = _data.fact;
            } else {
                const factIndex = Math.floor(Math.random() * _facts.length);
                result = _facts[factIndex];
            }
            return result;
        }

        // It creates an array of strings with facts about the dinosaur
        function createFacts() {
            const facts = [
                `The ${dinoData.species} weighed around ${dinoData.weight} lbs.`,
                `The height of ${getArticle(dinoData.species)} ${
                    dinoData.species
                } was ${Math.floor(dinoData.height / 12)} feet ${
                    dinoData.height % 12 != 0
                        ? 'and ' + (dinoData.height % 12) + ' inches'
                        : ''
                }.`,
                `The ${dinoData.species} lived in ${dinoData.where}.`,
                `It lived during the ${dinoData.when}.`,
                `The ${dinoData.species} was ${getArticle(dinoData.diet)} ${
                    dinoData.diet
                }.`,
                dinoData.fact,
            ];
            // We pass the full dinoData object as an argument
            // Each comparator will choose the particular piece of information that it needs
            // The comparators are always specific to one human being, so there is no need
            // to specify any data for them.
            for (const comparator in comparators) {
                facts.push(comparators[comparator](dinoData));
            }
            return facts;
        }

        const _species = dinoData.species;
        const _image = `./images/${dinoData.species.toLowerCase()}.png`;
        const _data = dinoData;
        const _facts = createFacts();

        // We return the information necessary to create a dinosaur card:
        // Its name, a path to an image and a fact about this dinosaur.
        // We also return a reference to the full data because it will be
        // shown when the user hovers over the dino image.
        return {
            get species() {
                return _species;
            },
            get image() {
                return _image;
            },
            get fullData() {
                return _data;
            },
            get fact() {
                return getFact();
            },
        };
    }

    // It makes an html grid tile with the information about an animal.
    // animal can be a dinosaur or a human
    function makeTile(animal) {
        const tile = document.createElement('DIV');
        tile.classList.add('grid-item');
        const heading = document.createElement('H3');
        heading.textContent = animal.species ? animal.species : animal.name;
        const image = document.createElement('IMG');
        image.src = animal.image;
        image.alt = animal.species ? animal.species : animal.name;
        tile.appendChild(heading);
        tile.appendChild(image);
        if (animal.fact) {
            const paragraph = document.createElement('P');
            paragraph.textContent = animal.fact;
            tile.appendChild(paragraph);
        }
        return tile;
    }

    // Fetch dino json data
    async function loadDinos() {
        const dinos = await fetch('/dino.json')
            .then((response) => response.json())
            .then((data) => data['Dinos'])
            .catch((error) => {
                document.getElementById('error').textContent =
                    'There was a problem while loading the data. Please refresh the page!';
            });
        return dinos;
    }

    // Main event handler. It removes the form and displays the tiles with the dinosaurs information.
    function handleSubmit() {
        // Reset error message
        document.getElementById('error').textContent = '';
        // Create Human Object
        const human = (function makeHuman() {
            return {
                name: document.getElementById('name').value,
                weight: document.getElementById('weight').value,
                height:
                    Number.parseInt(document.getElementById('feet').value) *
                        12 +
                    Number.parseInt(document.getElementById('inches').value),
                diet: document.getElementById('diet').value,
                image: './images/human.png',
            };
        })();

        if (
            validateUserInput(human.weight) &&
            validateUserInput(human.height)
        ) {
            // The methods in the comparators object will allow us to compare the human object with a dinosaur object
            const comparators = {
                compareWeight: createWeightComparator(human),
                compareHeight: createHeightComparator(human),
                compareDiet: createDietComparator(human),
            };
            // Create dino objects
            const dinos = jsonDinos.map((dino) => makeDino(dino, comparators));
            // The human is supposed to be at the center of the grid, so we insert it right in the middle of the array
            dinos.splice(4, 0, human);
            // Generate Tiles for each Dino in Array
            const tiles = dinos.map((animal) => makeTile(animal));

            // Add tiles to DOM
            const grid = document.getElementById('grid');
            const fragment = document.createDocumentFragment();
            tiles.forEach((tile) => fragment.appendChild(tile));
            grid.appendChild(fragment);

            // Remove form from screen
            document
                .getElementById('dino-compare')
                .classList.add('form--invisible');
        } else {
            document.getElementById('error').textContent =
                'Weight and height must be numbers greater than zero';
        }
    }

    // *** SET UP AND LAUNCH APPLICATION ***
    // Load dinos from json file
    // Since the dinosaur data doesn't change, we fetch them at page load
    // instead of inside handleSubmit to make sure we only fetch them once
    const jsonDinos = await loadDinos();
    // On button click, prepare and display infographic
    document.getElementById('btn').addEventListener('click', handleSubmit);
})();
