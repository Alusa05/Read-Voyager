//DOM Elements
const bookList = document.createElement('div');
    bookList.id = 'book-list';
    document.querySelector('main').appendChild(bookList);

    //State 
    let currentView = 'home';
    let books = [];
    let favorites = [];