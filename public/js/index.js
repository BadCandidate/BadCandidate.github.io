let currentLanguage = 'vi';
let currentTheme = 'dark';

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
}

        // Initialize theme toggle text based on current language
        document.addEventListener('DOMContentLoaded', function() {
            const themeToggle = document.querySelector('.theme-toggle');
            if (currentTheme === 'dark') {
                themeToggle.innerHTML = '<span data-lang="vi">🌙</span><span data-lang="en" style="display: none;">🌙</span>';
            } else {
                themeToggle.innerHTML = '<span data-lang="vi">☀️</span><span data-lang="en" style="display: none;">☀️</span>';
            }
        });

