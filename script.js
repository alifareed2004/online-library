//Syed Ahmed 
//Sky Ye 
//Dominic Botlero
//Group Project 
//ITEC 3020

//Global Variable
let info = null;

//Register 
function register(){
    let infoEntered = retrieveInfo();
    let readInfo = readingInfoFromLocalStorage(infoEntered);
    if (infoEntered == false) {
        document.getElementById('result').innerHTML = "Please Enter Your Information!";
    } else {
        if (info == null) {
            alert("Your Information has been successfully Inserted!");
            window.location.href = "login.html";
        } 
    }

}

// CREATE
// Retrieving info from Registration 
function retrieveInfo() {
    let userName = document.getElementById("un").value;
    let passWord = document.getElementById("pw").value;
    let confirmPassword = document.getElementById("cp").value;
    
    if (passWord !== confirmPassword) {
        alert('Passwords DO NOT match');
        return false;
    }

    let arr = [userName, passWord];
    if (arr.includes("")) {
        return false;
    } else {
        return arr;
    }
}

// Info in LocalStorage
function readingInfoFromLocalStorage(infoEntered) {
    // Storing info in Local storage
    let u = localStorage.setItem("Username", infoEntered[0]);
    let p = localStorage.setItem("Password", infoEntered[1]);

    // Read the info from local to registration 
    let u1 = localStorage.getItem("Username", u);
    let p1 = localStorage.getItem("Password", p);
 
    let arr = [u1, p1];
    return arr;
}


//Login 
function logIn(){
    //Retreive Login information from Login
    let usernameEntered = document.getElementById('un').value;
    let passwordEntered = document.getElementById('pw').value;

    //If nothing entered
    if (usernameEntered && passwordEntered == null){
        alert("Please enter your Username and Password")
    }

    //Retreive Username & Password from Local Storage
    let savedUsername = localStorage.getItem("Username");
    let savedPassword = localStorage.getItem("Password");

    if (usernameEntered == savedUsername && passwordEntered == savedPassword){
        alert("Login was successful!");
        window.location.href = "books.html";
    }
    else {
        alert("Your Username or Password is incorrect. Please try again.");
    }

}

//Forgot Password
function newPassword (){
    let usernameEntered = document.getElementById('un').value;
    let newPasswordEntered = document.getElementById('nw').value;
    let confirmPasswordEntered = document.getElementById('cw').value;

     if (usernameEntered && newPasswordEntered == null){
        alert("Please enter your Username and new Password")
    }

    let savedUsername = localStorage.getItem("Username");

    if (usernameEntered != savedUsername){
        alert("Your username is incorrect")
    }

    if (newPasswordEntered != confirmPasswordEntered){
        alert("Your passwords DO NOT MATCH")
    }

    if (usernameEntered == savedUsername && newPasswordEntered == confirmPasswordEntered){
        localStorage.setItem("Password", newPasswordEntered);
        alert("Your password has changed, Please try logining NOW!")
        window.location.href = "login.html";
    } 
}

async function bookPost() {
    let postEntered = await retrievePost(); 
    
    if (!postEntered) {
        alert("Please fill all fields to create a post.");
        return;
    }

    savePostToLocalStorage(postEntered); 
    alert("Your blog has been created!");
    document.getElementById('Posts').reset(); 
}

function retrievePost() {
    let postPage = document.getElementById("pp").value; 
    let postTitle = document.getElementById("pt").value; 
    let postMessage = document.getElementById("mg").value; 
    let imageInput = document.getElementById("ig").files[0]; 

    if (!postPage || !postTitle || !postMessage || !imageInput) {
        return false;
    }


    let reader = new FileReader();
    return new Promise((resolve) => {
        reader.onload = function (e) {
            resolve({
                page: postPage,
                title: postTitle,
                message: postMessage,
                image: e.target.result, 
            });
        };
        reader.readAsDataURL(imageInput); 
    });
}

function savePostToLocalStorage(postEntered) {
    const categoryKeyMap = {
        "Pride and Prejudice": "prideNPrejudice",
        "Fantasy Lovers": "fantasyLovers",
        "Mystery/Thriller": "mysteryThriller",
    };

    const categoryKey = categoryKeyMap[postEntered.page];
    if (!categoryKey) {
        alert("Invalid category selected.");
        return;
    }

    let categoryPosts = JSON.parse(localStorage.getItem(categoryKey)) || [];
    categoryPosts.push(postEntered);
   
    localStorage.setItem(categoryKey, JSON.stringify(categoryPosts));

    let allPosts = JSON.parse(localStorage.getItem("post")) || [];
    allPosts.push(postEntered);
    localStorage.setItem("post", JSON.stringify(allPosts));
}

function displayContainer(categoryKey, containerSelector, heading) {
    let posts = JSON.parse(localStorage.getItem(categoryKey)) || [];
    let postContainer = document.querySelector(containerSelector);

    if (!postContainer) return;

    postContainer.innerHTML = `<h2>${heading}</h2>`; 

    posts.forEach((post, index) => {
        let postElement = document.createElement('div');
        postElement.classList.add('discussion-item');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.message}</p>
            <img src="${post.image}" alt="Blog Image" style="width: 200px; height: auto;">
            <div class="likes-section">
                <button class="like-btn" data-index="${index}">Like</button>
                <span class="like-count" id="like-count-${index}">${post.likes || 0} Likes</span>
            </div>

             <div class="instagram-links">
                <a href="https://www.instagram.com/?hl=en" target="_blank">Share on Instagram</a>
            </div>

            <hr>
        `;
        postContainer.appendChild(postElement);
    });

    const likeBtn = document.querySelectorAll('.like-btn');
    likeBtn.forEach((button) => {
        button.addEventListener('click', function() {
            const likeIndex = button.getAttribute('data-index');
            let posts = JSON.parse(localStorage.getItem(categoryKey)) || [];

            posts[likeIndex].likes = (posts[likeIndex].likes || 0) + 1;

            localStorage.setItem(categoryKey, JSON.stringify(posts));

            const likeCountElement = document.getElementById(`like-count-${likeIndex}`);
            likeCountElement.textContent = `${posts[likeIndex].likes} Likes`;
        });
    });
}

function displayPride() {
    displayContainer("prideNPrejudice", "#prideContainer", "Forum Posts");
}

function displayFantasy() {
    displayContainer("fantasyLovers", "#fantasyContainer", "Forum Posts");
}

function displayMystery() {
    displayContainer("mysteryThriller", "#mysteryContainer", "Forum Posts");
}

displayPride();
displayFantasy();
displayMystery();

document.addEventListener("DOMContentLoaded", function() {
    const starRatings = document.querySelectorAll('.star');
    const userRating = document.getElementById('userRating');
    
    if (!userRating) return;

    const userSavedRating = localStorage.getItem('bookrating');
    if (userSavedRating) {
        userRating.textContent = userSavedRating;
        starRatings.forEach((star, index) => {
            if (index < userSavedRating) {
                star.classList.add('selected');
            }
        });
    }

    starRatings.forEach(star => {
        star.addEventListener('click', function() {
            let value = this.getAttribute('data-value');
            userRating.textContent = value;

            localStorage.setItem('bookrating', value);

            starRatings.forEach(star => star.classList.remove('selected'));
            for (let i = 0; i < value; i++) {
                starRatings[i].classList.add('selected');
            }
        });
    });
});




