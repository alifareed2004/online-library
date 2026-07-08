// Initialize variables
let dark_mode = localStorage.getItem("dark_mode");
const dark_mode_button = document.getElementById("theme-toggle");

// Enable Dark Mode Function
const enableDarkMode = () => {
    document.body.classList.add("dark-mode");
    localStorage.setItem("dark_mode", "active");
    // dark_mode_button.innerHTML = "Light Mode";
}

// Disable Dark Mode Function
const disableDarkMode = () => {
    document.body.classList.remove("dark-mode")
    localStorage.setItem("dark_mode", null);
    // dark_mode_button.innerHTML = "Dark Mode";
}

// If dark mode is already active, enable it
if (dark_mode === "active") enableDarkMode();

// Checks if the dark mode button is pressed and executes the appropriate function
dark_mode_button.addEventListener("click", () => {
    dark_mode = localStorage.getItem("dark_mode");
    if (dark_mode !== "active") {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
})
