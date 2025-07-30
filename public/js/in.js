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

// Make pdfUrl available globally for Waline configuration
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
    
    // Update Waline theme
    function updateWalineTheme(theme) {
        if (window.Waline) {
            // If Waline is already loaded, update its theme
            // Waline automatically adapts to system theme, but we can force it
            const walineContainer = document.getElementById('waline');
            if (walineContainer) {
                // Remove existing Waline instance
                walineContainer.innerHTML = '';
                // Reinitialize Waline with new theme
                initWaline(theme);
            }
        } else {
            // If Waline hasn't loaded yet, set the theme for when it does load
            window.walineTheme = theme;
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
        
        // Update Waline theme
        updateWalineTheme(currentTheme);
        
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
    
    // Initialize Waline with current theme
    updateWalineTheme(currentTheme);
    
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
    
    // Initialize Waline Comments
    function initWaline(theme = 'light') {
        const walineContainer = document.getElementById('waline');
        if (!walineContainer) return;
        
        // Clear existing content
        walineContainer.innerHTML = '';
        
        // Initialize Waline
        window.Waline.init({
            el: '#waline',
            serverURL: 'https://waline-bad-candidate.vercel.app', // You'll need to set up your own Waline server
            path: window.pdfUrl || window.location.href,
            dark: theme === 'dark',
            // Optional: customize appearance
            avatar: 'monsterid',
            avatarForce: false,
            meta: ['nick', 'mail', 'link'],
            requiredMeta: ['nick'],
            login: 'enable',
            wordLimit: 0,
            pageSize: 10,
            // Vietnamese language
            locale: {
                placeholder: 'Nhập bình luận của bạn...',
                submit: 'Gửi',
                reply: 'Trả lời',
                cancel: 'Hủy',
                like: 'Thích',
                unlike: 'Bỏ thích',
                comment: 'Bình luận',
                reply: 'Trả lời',
                more: 'Xem thêm',
                loading: 'Đang tải...',
                error: 'Có lỗi xảy ra',
                retry: 'Thử lại',
                login: 'Đăng nhập',
                logout: 'Đăng xuất',
                admin: 'Quản trị',
                sticky: 'Ghim',
                level: {
                    '0': 'Khách',
                    '1': 'Thành viên',
                    '2': 'Moderator',
                    '3': 'Admin'
                }
            }
        });
    }
    
    // Initialize Waline when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initWaline(currentTheme);
        });
    } else {
        initWaline(currentTheme);
    } 