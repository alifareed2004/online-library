//Ali Fareed 
//Sarim Hamid
//Syed Ahmed 
//Group Project 
//ITEC 4020

let allBooks = [];  // Stores all books loaded from the server
let genres = [];  // Stores the genres that are available

const ALLOWED_GENRES = [
    'Drama',
    'Fantasy fiction',
    'Fiction',
    'Detective and mystery stories'
];

// Splits a book's category string into an array of individual genres
function normalizeCategory(value) {
    if (!value) return [];

    return value.split(';')
        .map((item) => item.trim())
        .filter((item) => item);
}

// Finds the most common genres from the list of books
function getTopGenres(books, maxGenres = 12) {
    const counts = {};

    books.forEach((book) => {
        normalizeCategory(book.categories).forEach((category) => {
            if (counts[category]) {
                counts[category]++;
            } else {
                counts[category] = 1;
            }
        });
    });

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxGenres)
        .map((item) => item[0]);
}

// Groups books together based on their genre
function getBooksByGenre(books) {
    const byGenre = {};

    books.forEach((book) => {
        normalizeCategory(book.categories).forEach((category) => {

            if (!byGenre[category]) {
                byGenre[category] = [];
            }

            byGenre[category].push(book);
        });
    });

    return byGenre;
}

// Returns a random item from an array
function pickRandom(array) {
    if (!array || array.length === 0) return null;

    return array[Math.floor(Math.random() * array.length)];
}

// Randomly selects a set number of different genres
function chooseGenres(availableGenres, count = 4) {
    const options = [...availableGenres];
    const chosen = [];

    while (chosen.length < count && options.length > 0) {
        const index = Math.floor(Math.random() * options.length);
        chosen.push(options.splice(index, 1)[0]);
    }

    return chosen;
}

// Creates and displays the recommendation cards on the webpage
function renderRecommendations(books, genresSelected) {

    // Get the container where recommendation cards will be displayed
    const container = document.getElementById('recommendations-container');
    container.innerHTML = '';

    // Stop if there are no books to recommend
    if (!books || books.length === 0) {
        container.innerHTML = '<p>No books are available for recommendations.</p>';
        return;
    }

    const grouped = getBooksByGenre(books);
    const selectedGenres = genresSelected || genres;

    // Pick one random book from each selected genre
    const recommendationBlocks = selectedGenres.map((genre) => {
        const candidates = grouped[genre] || [];
        const book = pickRandom(candidates);

        return { genre, book };
    }).filter((item) => item.book);


    if (recommendationBlocks.length === 0) {
        container.innerHTML = '<p>Could not find enough genres with books.</p>';
        return;
    }

    // Create a card for each recommended book
    recommendationBlocks.forEach(({ genre, book }) => {

        const card = document.createElement('article');
        card.className = 'book-card';

        card.innerHTML = `
            <div class="book-cover">
                ${book.thumbnail
                    ? `<img src="${book.thumbnail}" alt="Cover of ${book.title}" loading="lazy">`
                    : '<div class="book-cover-placeholder">No Cover</div>'}
            </div>

            <div class="book-info">
                <h3 class="book-title">${book.title || 'Untitled'}</h3>
                <p class="book-genre">${genre}</p>
                <p class="book-authors">
                    ${(book.authors || 'Unknown Author').split(';').join(', ')}
                </p>
                <p class="book-meta">
                    ${book.published_year || ''}
                    ${book.published_year && book.average_rating ? ' · ' : ''}
                    ${book.average_rating ? `⭐ ${book.average_rating}` : ''}
                </p>
            </div>
        `;

        container.appendChild(card);
    });
}

// Updates the message showing how many genres are being displayed
function updateRecommendationInfo() {
    const info = document.getElementById('recommendation-info');

    if (!info) return;

    info.textContent = genres.length === 0
        ? 'No genres are available yet.'
        : `Showing random books from 4 different genres: Drama, Fantasy fiction, Fiction, Detective and mystery stories.`;
}

// Sets up the button to generate new recommendations when clicked
function setupRecommendationButton() {
    const button = document.getElementById('recommend-button');

    if (!button) return;

    button.addEventListener('click', () => {
        renderRecommendations(allBooks);
    });
}

// Loads the book data from the server and displays the initial recommendations
function initializeRecommendations() {

    const info = document.getElementById('recommendation-info');

    // Request the list of books from the server
    fetch('/books')
        .then((res) => res.json())
        .then((books) => {

            // Save the loaded books in allBooks
            allBooks = books;

            // Only keep the allowed genres that actually exist in the data
            genres = ALLOWED_GENRES.filter((genre) =>
                books.some((book) =>
                    normalizeCategory(book.categories).includes(genre)
                )
            );

            // Display the first set of recommendations
            renderRecommendations(allBooks, genres);
            
            updateRecommendationInfo();

        })
        .catch((err) => {

            console.error('Failed to load books for recommendations:', err);

            if (info) {
                info.textContent =
                    'Failed to load recommendations. Please try again later.';
            }
        });
}

// Runs the recommendation system after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    setupRecommendationButton();
    initializeRecommendations();
});