//Ali Fareed 
//Sarim Hamid
//Syed Ahmed 
//Group Project 
//ITEC 4020

const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const csvWriter = require('csv-writer').createObjectCsvWriter;

require('dotenv').config();

const app = express();

//Middleware to parse JSON
app.use(express.json());

//Serve the site's static files (html, css, js, images) from this same server
app.use(express.static(__dirname));

//PORT NUMBER
const PORT = 9000;

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
const { createArrayCsvWriter, createObjectCsvWriter } = require('csv-writer');
const openai = new OpenAI({
    apiKey: process.env.OpenAI_API_Key,
})

//First allow real ratings with a number, not empty blanks/missing (db has blanks/missing)
function hasRating(book){
    return !isNaN(parseFloat(book.average_rating));
}

//Tool to allow the AI to search books 
function searchBooks (keyword = '', category = '', min_rating = 0, sort = '', limit = 20) {
    //Set Variables
    let term = String(keyword).toLowerCase();
    let categoryTerm = String(category).toLowerCase();
    let minRating = parseFloat(min_rating) || 0;
    
    //Place any matches into array
    let match = [];

    //For loop to search for any matches
    for (let i = 0; i < books.length; i++){
        let book = books[i];
        let title = (book.title || '').toLowerCase();
        let author = (book.authors || '').toLowerCase();
        let bookCategory = (book.categories || '').toLowerCase();
        let bookRating = parseFloat(book.average_rating) || 0;

        //Setting conditions
        let matchKeyword = (!term) || title.includes(term) || author.includes(term) || bookCategory.includes(term);
        let matchCategory = (!categoryTerm) || bookCategory.includes(categoryTerm);
        let matchRating = bookRating >= minRating;

        //If any matches, push the over as a response
        if (matchKeyword && matchCategory && matchRating){
            match.push({
                title: book.title,
                author: book.authors,
                category: book.categories,
                average_rating: book.average_rating
            })
        
        }
    }
    //Sorting method 
        if (sort === 'rating_desc'){
            //Exclude unrated books instead of treating them as a 0
            match = match.filter(hasRating); 
            match.sort((a, b) => parseFloat (b.average_rating || 0)  - parseFloat(a.average_rating || 0));
        } else if (sort === 'rating_asc') {
            //Exclude unrated books instead of treating them as a 0
            match = match.filter(hasRating);
            match.sort((a, b) => parseFloat (a.average_rating || 0) - parseFloat(b.average_rating || 0));
        }
        return match.slice(0, limit);
}

//Initialize CSV writer 
const evaluationCsv = csvWriter({
    path: path.join(__dirname, 'Evaluation_Accuracy.csv'), 
    header: [
        { id: 'question', title:'Questions'},
        { id: 'response', title: 'OpenAI Response'},
        { id: 'time', title: 'Time Taken'}
    ],
    //Appends new evaluation rows without overwriting exisiting file 
    append:true
});


//Allow user requests to approach the AI for assistants 
app.post('/ask-Ai', async (req,res) => {
    //Start Time of the timer for evaulation 
    const startTime = Date.now();

    try {
    const {prompt} = req.body;

    const messages = [
            {   role:'system',
                content: 'You are a library assistant. Use the searchBooks tool to find matching books before recommending anything - only recommend books returned by the tool, never invent one. For "top N" / "highest rated" / "lowest rated" questions, always pass sort and limit to the tool rather than picking results yourself - do not re-sort or re-rank what the tool returns. When searching by genre/topic (e.g. "romance", "mystery"), if a category search returns few or no results, also try the same term as a keyword search before telling the user nothing was found - but always sanity-check that matches actually fit the genre before recommending them, since keyword matching can catch unrelated titles.'
            },
            {   role: 'user',
                content: prompt
            }];

    const tools = [{
            type : 'function',
            function: {
            name: 'searchBooks',
            description: 'Search the library dataset by title/author keyword, category, or minimum rating. Use sort + limit to answer "top N highest/lowest rated" style questions instead of picking from unsorted results.',
            parameters: {
                type: 'object',
                properties: {
                    keyword: { type: 'string', description: 'Matches against title or authors' },
                    category: { type: 'string', description: 'Matches the categories column' },
                    min_rating: { type: 'number', description: 'Minimum average_rating' },
                    sort: { type: 'string', enum: ['rating_desc', 'rating_asc'], description: 'Sort results by average_rating' },
                    limit: { type: 'number', description: 'Max number of results to return, defaults to 20' }
                }
                }
            }
    }];  

    let response = await openai.chat.completions.create({
        model:'gpt-3.5-turbo',
        messages : messages,
        tools : tools
    });

let message = response.choices[0].message;
    
//Track what the AI decided to do, for logging + optional UI display
const toolCalls = [];

    while (message.tool_calls) {
            messages.push(message);

            for (const call of message.tool_calls) {
                const args = JSON.parse(call.function.arguments || '{}');
                const results = searchBooks( args.keyword, args.category, args.min_rating, args.sort, args.limit);
            
                //Display output on log to understand any errors
                console.log(`[ask-Ai] called ${call.function.name} with`, args, `-> ${results.length} result(s)`);
                toolCalls.push({ name: call.function.name, args, resultCount: results.length });

                messages.push({
                    role: 'tool',
                    tool_call_id: call.id,
                    content: JSON.stringify(results)
            });
        }
        response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            tools
        });
        message = response.choices[0].message;
    }  

    //EndTime for the timer for evaluation
    const endTime = Date.now();
    //totaltime and convert milliseconds to seconds 
    const totalTime = ((endTime - startTime)/1000).toFixed(2);

    //Save data into the csv file 
    await evaluationCsv.writeRecords([{
        question : prompt,
        response : message.content,
        time : totalTime
    }]);

    //To display its reply
    res.json({reply: message.content, toolCalls});

   } catch(err) {
        console.error("AI Route Error:", err);
        res.status(500).json({error: 'An Error processing the AI response'});
   }   
});

//Listening on the PORT number 
app.listen(PORT, () => 
     console.log(`Listening at http://localhost:${PORT}`)
 );










