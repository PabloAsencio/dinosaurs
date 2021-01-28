// The whole code is enclosed in an IIFE so that we can declare it
// as async and use await to load the json file.
(async function () {
    // Create Dino Constructor
    // comparators is an object that contains several methods to compare a
    // dinosaur to a particular human being
    function makeDino(dinoData, comparators) {
        const _species = dinoData.species;
        const _image = `./images/${dinoData.species.toLowerCase()}.png`;
        const _data = dinoData;
        const _facts = populateFacts();

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

        function populateFacts() {
            const facts = [
                `The ${dinoData.species} weighed around ${dinoData.weight} lbs.`,
                `The height of ${getArticle(dinoData.species)} ${
                    dinoData.species
                } was ${dinoData.height} inches.`,
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
                facts.push(comparator(dinoData));
            }
            return facts;
        }

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
    // Create Dino Objects
    async function loadDinos() {
        const dinos = await fetch('/dino.json')
            .then((response) => response.json())
            .then((data) => data['Dinos'])
            .catch((error) => {
                // TODO: create the error--load element in the view and style it in css.
                document.getElementById('error--load').textContent =
                    'There was a problem while loading the data. Please refresh the page!';
            });
        return dinos;
    }

    // Create Dino Objects
    const dinos = (await loadDinos()).map(makeDino);

    // Create Human Object
    const human = {
        name: '',
        weight: 0,
        height: 0,
        diet: 'omnivore',
    };

    // Use IIFE to get human data from form

    // Create Dino Compare Method 1
    // NOTE: Weight in JSON file is in lbs, height in inches.
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
                } is about ${roundToOneDecimalPlace(
                    dino.weight / human.weight
                )} times as heavy as you.`;
            } else {
                result`You are about ${roundToOneDecimalPlace(
                    human.weight / dino.weight
                )} times as heavy as ${getArticle(dino.species)} ${
                    dino.species
                }`;
            }
            return result;
        };
    }

    // Create Dino Compare Method 2
    // NOTE: Weight in JSON file is in lbs, height in inches.

    // Create Dino Compare Method 3
    // NOTE: Weight in JSON file is in lbs, height in inches.

    // Generate Tiles for each Dino in Array

    // Add tiles to DOM

    // Remove form from screen

    // On button click, prepare and display infographic
    // Helper functions
    function roundToOneDecimalPlace(number) {
        // We use Number.EPSILON to make sure that numbers like 1.05 round correctly
        // See https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
        return Math.round((number + Number.EPSILON) * 10) / 10;
    }

    function getArticle(name, isLowerCase = true) {
        return `${isLowerCase ? 'a' : 'A'}${startsWithVowel(name) ? 'n' : ''}`;
    }

    function startsWithVowel(name) {
        return /^[AEIOUaeiou]/.test(name);
    }
})();
