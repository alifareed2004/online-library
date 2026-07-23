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
    apiKey: process.env.OpenAI_API_Key,
})


//Tool definition so the AI can search the dataset instead of receiving it all at once
const tools = [
    {
        type: 'function',
        function: {
            name: 'search_books',
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
    }
];

//A book only counts as "rated" if average_rating is a real number, not blank/missing as some of the books in the datsaset are.
function hasRating(book) {
    return book.average_rating !== undefined && book.average_rating !== '' && !isNaN(Number(book.average_rating));
}

//searchbooks tool for the GPT to use
function searchBooks({ keyword, category, min_rating, sort, limit } = {}) {
    let results = books.filter((b) => {
        if (keyword) {
            const haystack = `${b.title} ${b.authors}`.toLowerCase();
            if (!haystack.includes(keyword.toLowerCase())) return false;
        }
        if (category && !b.categories?.toLowerCase().includes(category.toLowerCase())) return false;
        if (min_rating && Number(b.average_rating) < Number(min_rating)) return false;
        return true;
    });

    //Fallback if a category search returns less than 3 result
    if (category && !keyword && results.length < 3) {
        const term = category.toLowerCase();
        const seen = new Set(results.map((b) => b.isbn13));
        for (const b of books) {
            if (seen.has(b.isbn13)) continue;
            if (!`${b.title} ${b.authors}`.toLowerCase().includes(term)) continue;
            if (min_rating && Number(b.average_rating) < Number(min_rating)) continue;
            results.push(b);
            seen.add(b.isbn13);
        }
    }

    if (sort === 'rating_desc' || sort === 'rating_asc') {
        results = results.filter(hasRating); //exclude unrated books instead of treating them as a 0
        results = results.sort((a, b) => (sort === 'rating_desc' ? -1 : 1) * (Number(a.average_rating) - Number(b.average_rating)));
    }

    return results.slice(0, Math.min(limit || 20, 20)); // temporary cap, can change if required
}

//Standard prompt for the AI to use the search_books tool instead of trying to answer questions itself
app.post('/ask-Ai', async (req,res) => {
   try {
    const {prompt} = req.body;
    const messages = [
        {role: 'system',
            content: 'You are a library assistant. Use the search_books tool to find matching books before recommending anything - only recommend books returned by the tool, never invent one. For "top N" / "highest rated" / "lowest rated" questions, always pass sort and limit to the tool rather than picking results yourself - do not re-sort or re-rank what the tool returns. When searching by genre/topic (e.g. "romance", "mystery"), if a category search returns few or no results, also try the same term as a keyword search before telling the user nothing was found - but always sanity-check that matches actually fit the genre before recommending them, since keyword matching can catch unrelated titles.'
        },
        {role: 'user',
            content: prompt
        },
    ];

    let response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        tools
    });
    let message = response.choices[0].message;

    //Track what the AI decided to do, for logging + optional UI display
    const toolCalls = [];

    //Thie while loops allows GPT to make multiple calls to the tool if it needs to refine the search.
    while (message.tool_calls) {
        messages.push(message);
        for (const call of message.tool_calls) {
            const args = JSON.parse(call.function.arguments || '{}');
            const results = searchBooks(args);

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

    res.json({reply: message.content, toolCalls});

   } catch(err) {
        res.status(500).json({error: 'An Error processing the AI response'});
   }
});

//Listening on the PORT number 
app.listen(PORT, () => 
     console.log(`Listening at http://localhost:${PORT}`)
 );

