//Ali Fareed 
//Sarim Hamid
//Syed Ahmed 
//Group Project 
//ITEC 4020

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


//FIXING --> Need a function for the forum of the books (possibly done in the server)





