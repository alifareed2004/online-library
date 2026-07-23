//js for the chatbot(TEST)
//Variables
const askForm = document.getElementById('askAi')
const input = document.getElementById('ask-input')
const output = document.getElementById('Ai-output-container');

//Escapes HTML so user/AI text can't break out of the markup 
function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

//Ai reply format
function formatAiReply(text) {
    let safe = escapeHtml(text || '');
    safe = safe.replace(/(?:^|\s)(\d{1,2}\.\s+)/g, '<br>$1').replace(/^<br>/, '');
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/\n/g, '<br>');
    return safe;
}

//Appends a message to the output, so there is a chat history
function appendMessage(sender, html) {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${sender}:</strong> ${html}`;
    output.appendChild(p);
}

//Event Listener for the form
askForm.addEventListener('submit', async (e) => {
    //Stoping the page from refreshing
    e.preventDefault();

    const prompt = input.value.trim();
    if (!prompt) return;

    //Clear the input after sent
    input.value = '';

    //Displaying the input of the user
    appendMessage('You', escapeHtml(prompt));

    //Calling the server using fetch, while awaiting for the response
    const res = await fetch('/ask-Ai', {
        method: 'POST',
        headers: {'Content-type' : 'application/json' },
        body: JSON.stringify({prompt : prompt}),
    });

    //The output
    const data = await res.json();

    //Displaying the output of the AI
    if(res.ok){
        appendMessage('AI', formatAiReply(data.reply));
    } else {
        appendMessage('AI', 'Error getting a response.');
    }
});

