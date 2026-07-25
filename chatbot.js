//js for the chatbot
//Variables
const askForm = document.getElementById('askAi') 
const input = document.getElementById('ask-input')
const output = document.getElementById('Ai-output-container');

//Format the Markdown/Linebreaks and convert to HTML
function formatAI(text){
    const div = document.createElement('div');
    //Escape from any special characters from markdown/linebreaks
    div.textContent = text || '';

    //Convert the escaped markdown/linebreaks to HTML
    return div.innerHTML
        .replace(/(?:^|\s)(\d{1,2}\.\s+)/g, '<br>$1').replace(/^<br>/, '')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}


//Function used to help have a clean output, format Markdown/Linebreaks, and add chat history in the html 
function sendMessage (sender, text) {
    const formatText = formatAI(text);

    const p = document.createElement('p');
    p.innerHTML = `<strong>${sender}:</strong> ${formatText}`;
    output.appendChild(p);

}


//Event Listener for the form 
askForm.addEventListener('submit', async (e) => {
    //Stoping the page from refreshing 
    e.preventDefault();
    
    const prompt = input.value.trim();
    if (!prompt) return;

    //Clear the input after sent 
    input.value ='';

    //Displaying the input of the user
    sendMessage('You', prompt);

    //Calling the server using fetch, while awaiting for the response
    const res = await fetch('/ask-Ai', {
        method: 'POST',
        headers: {'Content-Type' : 'application/json' },
        body: JSON.stringify({prompt : prompt}),
    });

    //The output
    const data = await res.json();

    //Displaying the output of the AI
    if(res.ok){
        sendMessage('AI', data.reply);
    } else {
        //Error message
        sendMessage('AI', 'Error getting a response.');
    }
});

