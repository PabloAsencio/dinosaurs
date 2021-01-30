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

    const jsonDinos = await loadDinos();

    // Get human data from form
    function getHuman() {
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
    // Create Dino Compare Method 1
    // NOTE: Weight in JSON file is in lbs, height in inches.
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

    // Create Dino Compare Method 2
    // NOTE: Weight in JSON file is in lbs, height in inches.
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
                console.log(human.height);
                result = `You are about ${roundToOneDecimalPlace(
                    human.height / dino.height
                )} times taller than ${getArticle(dino.species)} ${
                    dino.species
                }`;
            }

            return result;
        };
    }

    // Create Dino Compare Method 3
    // NOTE: Weight in JSON file is in lbs, height in inches.
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

    function handleSubmit() {
        // Create Human Object
        const human = getHuman();
        const comparators = {
            compareWeight: createWeightComparator(human),
            compareHeight: createHeightComparator(human),
            compareDiet: createDietComparator(human),
        };
        const dinos = jsonDinos.map((dino) => makeDino(dino, comparators));
        dinos.splice(4, 0, human);
        // Generate Tiles for each Dino in Array
        const tiles = dinos.map((animal) => makeTile(animal));

        // Add tiles to DOM
        const grid = document.getElementById('grid');
        const fragment = document.createDocumentFragment();
        tiles.forEach((tile) => fragment.appendChild(tile));
        grid.appendChild(fragment);

        // Remove form from screen
        document.getElementById('dino-compare').style = 'display: none';
    }

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

    // On button click, prepare and display infographic
    document.getElementById('btn').addEventListener('click', handleSubmit);

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
