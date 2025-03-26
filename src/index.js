//DOM Elements
const bookList = document.createElement('div');
    bookList.id = 'book-list';
    document.querySelector('main').appendChild(bookList);

    //State 
    let currentView = 'home';
    let books = [];
    let favorites = [];

    document.addEventListener('DOMContentLoaded', () => {
        fetchBooks();
        setupNavigation();

    });

    //Fetching the books from db.json
    async function fetchBooks() {
        try{
            const response = await fetch('http://localhost:3000/books');
            books = await response.json();
            if (currentView === 'home') displayBooks(books);
        } catch (error) {
 
            console.error('Error fetching books', error);
            bookList.innerHTML = `<p class="error">Failed to load books. Please try again later</p>`;
        }
        
    }

    // Displaying the books
function displayBooks(booksToDisplay) {
    bookList.innerHTML = booksToDisplay.map(book => `
        <div class="book-card" data-id="${book.id}">
            <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/150x200?text=No+Cover'">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <button class="favorite-btn"> Add to Favorites</button>
        </div>
    `).join('');

    //Adding the event listeners to the favorite button
    document.querySelectorAll(('.favorite-btn')).forEach(button => {
        button.addEventListener('click', (e) => {
            const bookId = parseInt(e.target.closest('.book-card').dataset.id);
            addToFavorites(bookId);
        });
        
    });

    }