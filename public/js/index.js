let currentLanguage = 'vi';
let currentTheme = 'light';

// Load saved preferences from localStorage
function loadPreferences() {
    const savedLanguage = localStorage.getItem('badCandidateLanguage');
    const savedTheme = localStorage.getItem('badCandidateTheme');
    
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }
    
    if (savedTheme) {
        currentTheme = savedTheme;
    }
}

// Save preferences to localStorage
function savePreferences() {
    localStorage.setItem('badCandidateLanguage', currentLanguage);
    localStorage.setItem('badCandidateTheme', currentTheme);
}

function toggleLanguage() {
    const viContent = document.querySelector('[data-lang="vi"]');
    const enContent = document.querySelector('[data-lang="en"]');
    const viButtons = document.querySelectorAll('[data-lang="vi"]');
    const enButtons = document.querySelectorAll('[data-lang="en"]');

    if (currentLanguage === 'vi') {
        viContent.classList.remove('active');
        enContent.classList.add('active');
        viButtons.forEach(btn => btn.style.display = 'none');
        enButtons.forEach(btn => btn.style.display = 'inline');
        currentLanguage = 'en';
    } else {
        enContent.classList.remove('active');
        viContent.classList.add('active');
        enButtons.forEach(btn => btn.style.display = 'none');
        viButtons.forEach(btn => btn.style.display = 'inline');
        currentLanguage = 'vi';
    }
    
    // Save language preference
    savePreferences();
}

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'light');
        currentTheme = 'light';
        themeToggle.innerHTML = '<span data-lang="vi">☀️</span><span data-lang="en" style="display: none;">☀️</span>';
    } else {
        body.setAttribute('data-theme', 'dark');
        currentTheme = 'dark';
        themeToggle.innerHTML = '<span data-lang="vi">🌙</span><span data-lang="en" style="display: none;">🌙</span>';
    }
    
    // Save theme preference
    savePreferences();
}

        // Initialize preferences and apply saved settings
        document.addEventListener('DOMContentLoaded', function() {
            // Load saved preferences
            loadPreferences();
            
            // Apply saved theme
            const body = document.body;
            body.setAttribute('data-theme', currentTheme);
            
            // Apply saved language
            const viContent = document.querySelector('[data-lang="vi"]');
            const enContent = document.querySelector('[data-lang="en"]');
            const viButtons = document.querySelectorAll('[data-lang="vi"]');
            const enButtons = document.querySelectorAll('[data-lang="en"]');
            
            if (currentLanguage === 'en') {
                viContent.classList.remove('active');
                enContent.classList.add('active');
                viButtons.forEach(btn => btn.style.display = 'none');
                enButtons.forEach(btn => btn.style.display = 'inline');
            } else {
                enContent.classList.remove('active');
                viContent.classList.add('active');
                enButtons.forEach(btn => btn.style.display = 'none');
                viButtons.forEach(btn => btn.style.display = 'inline');
            }
            
            // Set correct theme toggle icon
            const themeToggle = document.querySelector('.theme-toggle');
            if (currentTheme === 'dark') {
                themeToggle.innerHTML = '<span data-lang="vi">🌙</span><span data-lang="en" style="display: none;">🌙</span>';
            } else {
                themeToggle.innerHTML = '<span data-lang="vi">☀️</span><span data-lang="en" style="display: none;">☀️</span>';
            }
        });

