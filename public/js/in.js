// --- URL Parameter Handling ---

// Get PDF parameter from URL
const urlParams = new URLSearchParams(window.location.search);
const pdfParam = urlParams.get('pdf');

// Convert parameter format (e.g., "vn-250725DinhHuuLuan" to "vn/250725DinhHuuLuan.pdf")
let pdfUrl = '';
let fbCommentsUrl = '';

if (pdfParam) {
    // Split by dash to separate language code and filename
    const parts = pdfParam.split('-');
    if (parts.length >= 2) {
        const langCode = parts[0]; // e.g., "vn"
        const filename = parts.slice(1).join('-'); // e.g., "250725DinhHuuLuan"
        pdfUrl = `https://badcandidate.github.io/${langCode}/${filename}.pdf`;
        fbCommentsUrl = pdfUrl;
    }
}

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

/**
 * Safely update Facebook comments with error handling
 */
function updateFacebookComments() {
    try {
        const fbComments = document.querySelector('.fb-comments');
        const fallbackElement = document.getElementById('comments-fallback');
        const loadingElement = document.getElementById('comments-loading');
        
        if (fbComments) {
            fbComments.setAttribute('data-href', fbCommentsUrl);
            
            // Hide loading state
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            // Ensure comments are visible by default
            fbComments.style.display = 'block';
            if (fallbackElement) {
                fallbackElement.classList.add('hidden');
            }
            
            // Safely reload Facebook comments with new URL
            if (window.FB && typeof window.FB.XFBML === 'function') {
                try {
                    window.FB.XFBML.parse();
                    console.log('Facebook comments initialized successfully');
                } catch (fbError) {
                    console.warn('Facebook XFBML parse error:', fbError);
                    // Don't show fallback immediately, try again
                    setTimeout(() => {
                        try {
                            if (window.FB && typeof window.FB.XFBML === 'function') {
                                window.FB.XFBML.parse();
                                console.log('Facebook comments retry successful');
                            } else {
                                console.warn('Facebook SDK not available on retry');
                                showCommentsFallback();
                            }
                        } catch (retryError) {
                            console.warn('Facebook SDK retry failed:', retryError);
                            showCommentsFallback();
                        }
                    }, 2000);
                }
            } else {
                console.log('Facebook SDK not available, waiting for initialization...');
                // Don't show fallback immediately, wait for SDK to load
            }
        }
    } catch (error) {
        console.warn('Error updating Facebook comments:', error);
        // Only show fallback for critical errors
        if (error.message && error.message.includes('critical')) {
            showCommentsFallback();
        }
    }
}

/**
 * Show fallback message for comments
 */
function showCommentsFallback() {
    const fallbackElement = document.getElementById('comments-fallback');
    const fbComments = document.querySelector('.fb-comments');
    const loadingElement = document.getElementById('comments-loading');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    if (fallbackElement) {
        fallbackElement.classList.remove('hidden');
    }
    if (fbComments) {
        fbComments.style.display = 'none';
    }
}

/**
 * Hide fallback message for comments
 */
function hideCommentsFallback() {
    const fallbackElement = document.getElementById('comments-fallback');
    const fbComments = document.querySelector('.fb-comments');
    const loadingElement = document.getElementById('comments-loading');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    if (fallbackElement) {
        fallbackElement.classList.add('hidden');
    }
    if (fbComments) {
        fbComments.style.display = 'block';
    }
}

/**
 * Initialize Facebook SDK with error handling
 */
function initFacebookSDK() {
    try {
        console.log('Initializing Facebook SDK...');
        
        // Check if Facebook SDK is already loaded
        if (window.FB) {
            console.log('Facebook SDK already loaded');
            updateFacebookComments();
            return;
        }

        // Wait for Facebook SDK to load
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds total (50 * 100ms)
        
        const checkFB = setInterval(() => {
            attempts++;
            if (window.FB) {
                clearInterval(checkFB);
                console.log('Facebook SDK loaded after', attempts, 'attempts');
                updateFacebookComments();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkFB);
                console.warn('Facebook SDK failed to load after', maxAttempts, 'attempts');
                showCommentsFallback();
            }
        }, 100);

    } catch (error) {
        console.warn('Error initializing Facebook SDK:', error);
        // Don't show fallback immediately for initialization errors
    }
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
        
        // Initialize Facebook SDK with error handling
        initFacebookSDK();
        
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