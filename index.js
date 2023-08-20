const API = 'https://64df65e471c3335b25828e1b.mockapi.io/api/v1/';
const METHODS = {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE',
};

async function controller(action, method = 'GET', body) {
    const URL = `${API}${action}`;

    const params = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) params.body = JSON.stringify(body);

    try {
        const response = await fetch(URL, params);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (err) {
        console.log(err);
    }
}

const heroesForm = document.querySelector('#heroesForm');
const heroesTable = document.querySelector('#heroesTable').querySelector('tbody');

async function loadComicsOptions() {
    try {
        const comicsData = await controller('universes', METHODS.GET);
        const selectElement = heroesForm.querySelector('[data-name="heroComics"]');

        comicsData.forEach(comics => {
            const option = document.createElement('option');
            option.value = comics.name;
            option.textContent = comics.name;
            selectElement.append(option);
        });
    } catch (err) {
        console.log(err);
    }
}

async function loadAndDisplayHeroes() {
    try {
        const existingHeroes = await controller('heroes', METHODS.GET);
        const tbody = document.querySelector('#heroesTable tbody');
        tbody.innerHTML = '';

        existingHeroes.forEach(hero => {
            const newRow = tbody.insertRow();
            insertHeroDataIntoRow(newRow, hero);
        });
    } catch (err) {
        console.log(err);
    }
}

function insertHeroDataIntoRow(row, hero) {
    const nameCell = row.insertCell();
    const comicsCell = row.insertCell();
    const favouriteCell = row.insertCell();
    const actionsCell = row.insertCell();

    nameCell.textContent = hero.name;
    comicsCell.textContent = hero.comics;

    const favouriteCheckbox = document.createElement('input');
    favouriteCheckbox.type = 'checkbox';
    favouriteCheckbox.checked = hero.favourite;
    favouriteCell.append(favouriteCheckbox);

    favouriteCheckbox.addEventListener('change', async () => {
        const updatedHero = {
            favourite: favouriteCheckbox.checked,
        };

        try {
            await controller(`heroes/${hero.id}`, METHODS.PUT, updatedHero);
        } catch (err) {
            console.log(err);
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.type = 'button';
    actionsCell.append(deleteButton);

    deleteButton.addEventListener('click', async () => {
        try {
            await controller(`heroes/${hero.id}`, METHODS.DELETE);
            row.remove();
        } catch (err) {
            console.log(err);
        }
    });
}

loadComicsOptions();
loadAndDisplayHeroes();

heroesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const heroName = heroesForm.querySelector('[data-name="heroName"]').value;
    const heroComicsSelect = heroesForm.querySelector('[data-name="heroComics"]');
    const heroComics = heroComicsSelect.value;
    const heroFavourite = heroesForm.querySelector('[data-name="heroFavourite"]').checked;

    const existingHeroes = await controller('heroes', METHODS.GET);
    const heroExists = existingHeroes.some(hero => hero.name === heroName);

    if (heroExists) {
        alert(`Герой з ім'ям ${heroName} вже внесено до таблиці.`);
        return;
    }

    const newHero = {
        name: heroName,
        comics: heroComics,
        favourite: heroFavourite,
    };

    try {
        const addedHero = await controller('heroes', METHODS.POST, newHero);
        const newRow = heroesTable.insertRow();
        insertHeroDataIntoRow(newRow, addedHero);

        heroesForm.reset();
    } catch (err) {
        console.log(err);
    }
});