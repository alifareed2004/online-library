//js for the chatbot(TEST)
//Variables
const askForm = document.getElementById('askAi') 
const input = document.getElementById('ask-input')
const output = document.getElementById('Ai-output-container');

//Event Listener for the form 
askForm.addEventListener('submit', async (e) => {
    //Stoping the page from refreshing 
    e.preventDefault();
    
    const prompt = input.value.trim();
    if (!prompt) return;

    //Clear the input after sent 
    prompt.value ='';

    //Displaying the input of the user
    output.innerHTML = '<p>You: ' +prompt+ '</p><br>';

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
        output.innerHTML = '<p>AI: ' +data.reply + '</p>';
    } else {
        output.innerHTML = '<p>AI: Error getting a response.</p>'; 
    }
});

