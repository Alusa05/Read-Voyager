// DOM Elements
const bookList = document.createElement('div');
bookList.id = 'book-list';
document.querySelector('main').appendChild(bookList);

// State 
let currentView = 'home';
let books = [];
let favorites = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
    setupNavigation();
});

// Fetching the books from db.json
async function fetchBooks() {
    try {
        const response = await fetch('https://read-voyager-json-server.vercel.app/books');
        books = await response.json();
        if (currentView === 'home') displayBooks(books);
        
        // Also fetch initial favorites
        const favResponse = await fetch('https://read-voyager-json-server.vercel.app/favorites');
        favorites = await favResponse.json();
    } catch (error) {
        console.error('Error fetching books', error);
        bookList.innerHTML = '<p class="error">Failed to load books. Please try again later</p>';
    }
}

// Displaying the books
function displayBooks(booksToDisplay) {
    bookList.innerHTML = booksToDisplay.map(book => `
        <div class="book-card" data-id="${book.id}">
            <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/150x200?text=No+Cover'">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <button class="favorite-btn" ${isFavorite(book.id) ? 'disabled' : ''}>
                ${isFavorite(book.id) ? '★ Favorited' : '☆ Add to Favorites'}
            </button>
        </div>
    `).join('');

    // Adding the event listeners to the favorite button
    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const bookId = parseInt(e.target.closest('.book-card').dataset.id);
            addToFavorites(bookId);
        });
    });
}

// Check if book is already favorited
function isFavorite(bookId) {
    return favorites.some(fav => fav.id === bookId);
}

// Navigation setup
function setupNavigation() {
    document.getElementById('home-link').addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'home';
        updateActiveNav(e.target);
        displayBooks(books);
    });

    document.getElementById('favorites-link').addEventListener('click', async (e) => {
        e.preventDefault();
        currentView = 'favorites';
        updateActiveNav(e.target);
        try {
            const response = await fetch('https://read-voyager-json-server.vercel.app/favorites');
            favorites = await response.json();
            displayBooks(favorites);
        } catch (error) {
            console.error("Error fetching favorites:", error);
            bookList.innerHTML = '<p class="error">Failed to load favorites</p>';
        }
    });
}

function updateActiveNav(clickedLink) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    clickedLink.classList.add('active');
}

// Add to favorites
async function addToFavorites(bookId) {
    const book = books.find(b => b.id === bookId);
    try {
        const response = await fetch('https://read-voyager-json-server.vercel.app/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(book)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add favorite');
        }
        
        const newFavorite = await response.json();
        favorites.push(newFavorite); 
        
        const buttons = document.querySelectorAll(`.book-card[data-id="${bookId}"] .favorite-btn`);
        buttons.forEach(btn => {
            btn.textContent = ' Favorited';
            btn.disabled = true;
        });
        
        showNotification(`"${newFavorite.title}" added to favorites!`);
        
        if (currentView === 'favorites') {
            displayBooks(favorites);
        }
    } catch (error) {
        console.error("Error adding to favorites:", error);
        showNotification("Failed to add favorite. Please try again.", true);
    }
}

async function removeFromFavorites(bookId) {
    try {
        const response = await fetch(`https://read-voyager-json-server.vercel.app/favorites/${bookId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to remove favorite');
        
        favorites = favorites.filter(fav => fav.id !== bookId);
        
        document.querySelector(`.book-card[data-id="${bookId}"]`)?.remove();
        
        showNotification(`Book removed from favorites!`);
        
    } catch (error) {
        console.error("Error removing favorite:", error);
        showNotification("Failed to remove favorite. Please try again.", true);
    }
}

function displayBooks(booksToDisplay) {
    bookList.innerHTML = booksToDisplay.map(book => `
        <div class="book-card" data-id="${book.id}">
            <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/150x200?text=No+Cover'">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            ${currentView === 'favorites' ? 
                `<button class="unfavorite-btn">Remove from Favorites</button>` : 
                `<button class="favorite-btn" ${isFavorite(book.id) ? 'disabled' : ''}>
                    ${isFavorite(book.id) ? '★ Favorited' : '☆ Add to Favorites'}
                </button>`
            }
        </div>
    `).join('');

 
    if (currentView === 'favorites') {
        document.querySelectorAll('.unfavorite-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookId = parseInt(e.target.closest('.book-card').dataset.id);
                removeFromFavorites(bookId);
            });
        });
    } else {
        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookId = parseInt(e.target.closest('.book-card').dataset.id);
                addToFavorites(bookId);
            });
        });
    }
}
