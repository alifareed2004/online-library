//Ali Fareed 
//Sarim Hamid
//Syed Ahmed 
//Group Project 
//ITEC 4020

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

//Middleware to parse JSON
app.use(express.json());

//PORT NUMBER
const PORT = 9000

//Array list for csv file 
let books =[];

//Readin Books.csv file into an array
fs.readFile('books.csv', 'utf-8', (err, data) => {
    if (err) throw err;
    
    //Converting the data into lines
    const lines = data.split('\n');

    //Creating a Header for the data 
    const headers = lines[0].split(',');

    //For every line create a book object
    for (let i = 1; i < lines.length; i++){
        //Skipping empty spaces
        if (lines[i].trim() === '') 
            continue;

        const values = lines[i].split(',');
        const book = {}

        headers.forEach((header, index) => {
            book[header] = values[index];
        });

        books.push(book);
    }
})

//Books Page 
//Searching a Book from the Database 
//First Get all the books
app.get('/books', (req,res) => {
    res.json(books);
})


//Adding a book



//Random Book from the database


app.listen(PORT, () => 
     console.log(`Listening at http://localhost:${PORT}`)
 );

