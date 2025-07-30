// --- URL Parameter Handling ---

// Get PDF parameter from URL
const urlParams = new URLSearchParams(window.location.search);
const pdfParam = urlParams.get('pdf');

// Convert parameter format (e.g., "vn-250725DinhHuuLuan" to "vn/250725DinhHuuLuan.pdf")
let pdfUrl = '';

if (pdfParam) {
    // Split by dash to separate language code and filename
    const parts = pdfParam.split('-');
    if (parts.length >= 2) {
        const langCode = parts[0]; // e.g., "vn"
        const filename = parts.slice(1).join('-'); // e.g., "250725DinhHuuLuan"
        pdfUrl = `https://badcandidate.github.io/${langCode}/${filename}.pdf`;
    }
}

// Make pdfUrl available globally for Disqus configuration
window.pdfUrl = pdfUrl;

// Fallback URL if no parameter or invalid format
if (!pdfUrl) {
    window.location.href = '/';
}

// --- PDF.js Setup ---

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
const scale = 1.5;

const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        const renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    // Update page counters
    document.getElementById('page-num').textContent = num;
    updateNavButtons();
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finished. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

/**
 * Displays next page.
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

/**
 * Disables or enables navigation buttons based on the current page.
 */
function updateNavButtons() {
    document.getElementById('next-page').disabled = (pageNum >= pdfDoc.numPages);
    document.getElementById('prev-page').disabled = (pageNum <= 1);
}



// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Add event listeners for navigation buttons
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        
        if (prevButton) {
            prevButton.addEventListener('click', onPrevPage);
        }
        if (nextButton) {
            nextButton.addEventListener('click', onNextPage);
        }
        
        // Set up redirect PDF button
        const redirectBtn = document.getElementById('redirect-pdf-btn');
        if (redirectBtn) {
            redirectBtn.href = pdfUrl;
        }
        
        // Load PDF document with error handling
        pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            const pageCountElement = document.getElementById('page-count');
            if (pageCountElement) {
                pageCountElement.textContent = pdfDoc.numPages;
            }
            if (loader) {
                loader.style.display = 'none'; // Hide loader
            }
            renderPage(pageNum);
        }).catch(function(error) {
            console.error('Error loading PDF:', error);
            if (loader) {
                loader.textContent = 'Failed to load PDF. Please try again or check the console for details.';
            }
            // This can happen due to CORS policy. For a real project, 
            // ensure your PDF is served from the same origin or with proper CORS headers.
        });
        
            } catch (error) {
            console.error('Error in DOMContentLoaded:', error);
        }
    });
    
    // Theme toggle functionality
    let currentTheme = 'light';
    
    // Load saved theme preference
    function loadThemePreference() {
        const savedTheme = localStorage.getItem('badCandidateTheme');
        if (savedTheme) {
            currentTheme = savedTheme;
        }
    }
    
    // Save theme preference
    function saveThemePreference() {
        localStorage.setItem('badCandidateTheme', currentTheme);
    }
    
    // Update Disqus theme
    function updateDisqusTheme(theme) {
        if (window.DISQUS) {
            // If Disqus is already loaded, update its theme
            window.DISQUS.reset({
                reload: true,
                config: function() {
                    this.page.identifier = window.pdfUrl || window.location.href;
                    this.page.url = window.location.href;
                    this.page.theme = theme;
                }
            });
        } else {
            // If Disqus hasn't loaded yet, set the theme for when it does load
            window.disqusTheme = theme;
        }
    }
    
    // Toggle theme function
    function toggleTheme() {
        const body = document.body;
        const themeToggle = document.querySelector('.theme-toggle');
        
        if (currentTheme === 'dark') {
            body.setAttribute('data-theme', 'light');
            currentTheme = 'light';
            themeToggle.innerHTML = '<span>☀️</span>';
        } else {
            body.setAttribute('data-theme', 'dark');
            currentTheme = 'dark';
            themeToggle.innerHTML = '<span>🌙</span>';
        }
        
        // Update Disqus theme
        updateDisqusTheme(currentTheme);
        
        // Save theme preference
        saveThemePreference();
    }
    
    // Make toggleTheme available globally
    window.toggleTheme = toggleTheme;
    
    // Initialize theme on page load
    loadThemePreference();
    document.body.setAttribute('data-theme', currentTheme);
    
    // Set correct theme toggle icon
    const themeToggle = document.querySelector('.theme-toggle');
    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<span>🌙</span>';
    } else {
        themeToggle.innerHTML = '<span>☀️</span>';
    }
    
    // Initialize Disqus with current theme
    updateDisqusTheme(currentTheme);
    
    // Highlight box collapse/expand functionality
    function hideHighlight() {
        const highlightBox = document.getElementById('highlight-box');
        const guideIconBtn = document.getElementById('guide-icon-btn');
        
        // Add collapsing animation
        highlightBox.classList.add('collapsing');
        
        setTimeout(() => {
            highlightBox.style.display = 'none';
            guideIconBtn.style.display = 'flex';
            
            // Save state and timestamp to localStorage
            localStorage.setItem('highlightCollapsed', 'true');
            localStorage.setItem('highlightLastHideTime', Date.now().toString());
        }, 300);
    }
    
    function showHighlight() {
        const highlightBox = document.getElementById('highlight-box');
        const guideIconBtn = document.getElementById('guide-icon-btn');
        
        guideIconBtn.style.display = 'none';
        highlightBox.style.display = 'block';
        highlightBox.classList.remove('collapsing');
        
        // Save state to localStorage and reset counters
        localStorage.setItem('highlightCollapsed', 'false');
        localStorage.setItem('highlightPageLoadCount', '0');
        localStorage.removeItem('highlightLastHideTime');
    }
    
    // Smart highlight box state management
    function checkHighlightState() {
        const highlightBox = document.getElementById('highlight-box');
        const guideIconBtn = document.getElementById('guide-icon-btn');
        
        const now = Date.now();
        const lastHideTime = localStorage.getItem('highlightLastHideTime');
        const pageLoadCount = parseInt(localStorage.getItem('highlightPageLoadCount') || '0');
        const wasCollapsed = localStorage.getItem('highlightCollapsed');
        
        // Increment page load count
        const newPageLoadCount = pageLoadCount + 1;
        localStorage.setItem('highlightPageLoadCount', newPageLoadCount.toString());
        
        // Check if we should force show the highlight box
        const shouldForceShow = shouldShowHighlightBox(now, lastHideTime, newPageLoadCount);
        
        if (shouldForceShow) {
            // Force show the highlight box
            highlightBox.style.display = 'block';
            guideIconBtn.style.display = 'none';
            localStorage.setItem('highlightCollapsed', 'false');
            
            // Reset counters
            localStorage.setItem('highlightPageLoadCount', '0');
            localStorage.removeItem('highlightLastHideTime');
        } else if (wasCollapsed === 'true') {
            // Show collapsed state (icon only)
            highlightBox.style.display = 'none';
            guideIconBtn.style.display = 'flex';
        } else {
            // Show full highlight box
            highlightBox.style.display = 'block';
            guideIconBtn.style.display = 'none';
        }
    }
    
    function shouldShowHighlightBox(currentTime, lastHideTime, pageLoadCount) {
        // Show if page has been loaded 10+ times
        if (pageLoadCount >= 10) {
            return true;
        }
        
        // Show if 8 hours have passed since last hide
        if (lastHideTime) {
            const eightHoursInMs = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
            const timeSinceHide = currentTime - parseInt(lastHideTime);
            if (timeSinceHide >= eightHoursInMs) {
                return true;
            }
        }
        
        return false;
    }
    
    // Make functions available globally
    window.hideHighlight = hideHighlight;
    window.showHighlight = showHighlight;
    
    // Initialize highlight state on page load
    setTimeout(checkHighlightState, 100);
    
    // Initialize Disqus Comments
    var disqus_config = function () {
        this.page.url = window.location.href;  // Current page URL
        this.page.identifier = window.pdfUrl || window.location.href; // Use pdfUrl as identifier, fallback to current URL
        this.page.theme = window.disqusTheme || currentTheme; // Set theme based on current theme
    };
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://badcandidate.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
    
    // Load Disqus Count Script
    var countScript = document.createElement('script');
    countScript.id = 'dsq-count-scr';
    countScript.src = '//badcandidate.disqus.com/count.js';
    countScript.async = true;
    document.head.appendChild(countScript); 