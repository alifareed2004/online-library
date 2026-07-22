//ITEC 4020

// js for book display from database, to display a 5x10 grid for books

const BOOKS_PER_ROW = 5;
const ROWS_PER_PAGE = 10;
const BOOKS_PER_PAGE = BOOKS_PER_ROW * ROWS_PER_PAGE;

let allBooks = [];
let filteredBooks = [];
let currentPage = 1;

// get book data from server and set up search and filter functions
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('books-container');
    if (!container) return;

    fetch('/books')
        .then((res) => res.json())
        .then((books) => {
            allBooks = books;
            filteredBooks = books;
            populateCategoryFilter(books);
            displayPage(currentPage);
        })
        .catch((err) => {
            container.innerHTML = '<p>Sorry, the book list could not be loaded right now.</p>';
            console.error('Failed to load books:', err);
        });

    const form = document.getElementById('book-search-form');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            applyFilters();
        });
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 250));
    }

    setupWindow();
});

// Goes through each book to create categories list for dropdown 
function populateCategoryFilter(books) {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    const categories = new Set();
    books.forEach((book) => {
        (book.categories || '').split(';').forEach((category) => {
            const trimmed = category.trim();
            if (trimmed) categories.add(trimmed);
        });
    });

    [...categories].sort().forEach((category) => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = (document.getElementById('search-input').value || '').trim().toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;

    filteredBooks = allBooks.filter((book) => {
        const matchesSearch = !searchTerm
            || (book.title || '').toLowerCase().includes(searchTerm)
            || (book.authors || '').toLowerCase().includes(searchTerm);

        const matchesCategory = !selectedCategory
            || (book.categories || '').split(';').map((c) => c.trim()).includes(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    displayPage(1);
}

// displays the books and handles the logic for pagnation
function displayPage(page, shouldScroll = false) {
    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / BOOKS_PER_PAGE));
    currentPage = Math.min(Math.max(1, page), totalPages);

    const start = (currentPage - 1) * BOOKS_PER_PAGE;
    const pageBooks = filteredBooks.slice(start, start + BOOKS_PER_PAGE);

    displayBooks(pageBooks);
    displayPagination(totalPages);

    if (shouldScroll) {
        document.getElementById('books-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function displayBooks(books) {
    const container = document.getElementById('books-container');
    container.innerHTML = '';

    if (books.length === 0) {
        container.innerHTML = '<p>No books found.</p>';
        return;
    }

    books.forEach((book) => container.appendChild(createBookCard(book)));
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${book.title || 'Untitled'}`);

    const authors = (book.authors || 'Unknown Author').split(';').join(', ');
    const year = book.published_year ? book.published_year : '';
    const rating = book.average_rating ? `⭐ ${book.average_rating}` : '';

    card.innerHTML = `
        <div class="book-cover">
            ${book.thumbnail
                ? `<img src="${book.thumbnail}" alt="Cover of ${book.title}" loading="lazy" onerror="this.outerHTML='<div class=&quot;book-cover-placeholder&quot;>No Cover</div>'">`
                : '<div class="book-cover-placeholder">No Cover</div>'}
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title || 'Untitled'}</h3>
            <p class="book-authors">${authors}</p>
            <p class="book-meta">${year}${year && rating ? ' &middot; ' : ''}${rating}</p>
        </div>
    `;

    card.addEventListener('click', () => openBookWindow(book));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openBookWindow(book);
        }
    });

    return card;
}

// Sets up the window's close interactions (close button, backdrop click, Escape key)
function setupWindow() {
    const windowEl = document.getElementById('book-window');
    const closeBtn = document.getElementById('window-close');
    if (!windowEl || !closeBtn) return;

    closeBtn.addEventListener('click', closeBookWindow);
    windowEl.addEventListener('click', (e) => {
        if (e.target === windowEl) closeBookWindow();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !windowEl.classList.contains('hidden')) closeBookWindow();
    });
}

// Escapes HTML so book data can't break out of the markup we build
function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function openBookWindow(book) {
    const windowEl = document.getElementById('book-window');
    const windowBody = document.getElementById('window-body');
    if (!windowEl || !windowBody) return;

    const authors = (book.authors || 'Unknown Author').split(';').join(', ');
    const categories = (book.categories || '').split(';').map((c) => c.trim()).filter(Boolean).join(', ');
    const year = book.published_year ? book.published_year : '';
    const rating = book.average_rating ? `⭐ ${book.average_rating}` : '';
    const pages = book.num_pages ? `${book.num_pages} pages` : '';
    const ratingsCount = book.ratings_count ? `${Number(book.ratings_count).toLocaleString()} ratings` : '';
    const description = book.description || 'No description available.';

    const metaLine = [year, rating, pages, ratingsCount].filter(Boolean).join(' &middot; ');

    windowBody.innerHTML = `
        <div class="window-book">
            <div class="window-book-cover">
                ${book.thumbnail
                    ? `<img src="${book.thumbnail}" alt="Cover of ${escapeHtml(book.title)}" onerror="this.outerHTML='<div class=&quot;book-cover-placeholder&quot;>No Cover</div>'">`
                    : '<div class="book-cover-placeholder">No Cover</div>'}
            </div>
            <div class="window-book-info">
                <h2 class="window-book-title">${escapeHtml(book.title || 'Untitled')}</h2>
                ${book.subtitle ? `<p class="window-book-subtitle">${escapeHtml(book.subtitle)}</p>` : ''}
                <p class="window-book-authors">${escapeHtml(authors)}</p>
                ${categories ? `<p class="window-book-categories">${escapeHtml(categories)}</p>` : ''}
                ${metaLine ? `<p class="window-book-meta">${metaLine}</p>` : ''}
                <p class="window-book-description">${escapeHtml(description)}</p>
            </div>
        </div>
    `;

    windowEl.classList.remove('hidden');
    document.body.classList.add('window-open');
}

function closeBookWindow() {
    const windowEl = document.getElementById('book-window');
    if (!windowEl) return;
    windowEl.classList.add('hidden');
    document.body.classList.remove('window-open');
}

// displays the pagination btns as well as handles the logic for the btns
function displayPagination(totalPages) {
    const controls = document.getElementById('pagination-controls');
    controls.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => displayPage(currentPage - 1, true));
    controls.appendChild(prevBtn);

    const status = document.createElement('span');
    status.className = 'pagination-status';
    status.textContent = `Page ${currentPage} of ${totalPages}`;
    controls.appendChild(status);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => displayPage(currentPage + 1, true));
    controls.appendChild(nextBtn);
}

function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
