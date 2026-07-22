//Ali Fareed 
//Sarim Hamid
//Syed Ahmed 
//Group Project 
//ITEC 4020

const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

require('dotenv').config();

const app = express();

//Middleware to parse JSON
app.use(express.json());

//Serve the site's static files (html, css, js, images) from this same server
app.use(express.static(__dirname));

//PORT NUMBER
const PORT = 9000

//Array list for csv file
let books =[];

// Reading books.csv file into an array, this method handles the commas that are present in the dataset.
fs.createReadStream('books.csv')
    .pipe(csv())
    .on('data', (book) => books.push(book))
    .on('error', (err) => { throw err; });


app.get('/books', (req,res) => {
    res.json(books);
})


//Agentic Approach
//Get OpenAI API Key
const {OpenAI} = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

//Creating new file for evaulation 









//Listening on the PORT number 
app.listen(PORT, () => 
     console.log(`Listening at http://localhost:${PORT}`)
 );

