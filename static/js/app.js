document.addEventListener('DOMContentLoaded', () => {
    // Global state
    let cachedReleases = [];
    let activeFilter = 'all';
    let searchQuery = '';

    // DOM Elements
    const btnRefresh = document.getElementById('btn-refresh');
    const refreshSpinner = document.getElementById('refresh-spinner');
    const syncTime = document.getElementById('sync-time');
    const feedTimeline = document.getElementById('feed-timeline');
    const feedLoader = document.getElementById('feed-loader');
    const feedError = document.getElementById('feed-error');
    const errorMessage = document.getElementById('error-message');
    const btnRetry = document.getElementById('btn-retry');
    
    // Search & Filter DOM Elements
    const searchInput = document.getElementById('search-input');
    const btnClearSearch = document.getElementById('btn-clear-search');
    const filterChips = document.querySelectorAll('.filter-chips .chip');
    
    // Stats DOM Elements
    const statTotal = document.getElementById('stat-total');
    const statFeatures = document.getElementById('stat-features');
    const statBreaking = document.getElementById('stat-breaking');
    const statIssues = document.getElementById('stat-issues');

    // Dialog DOM Elements
    const tweetDialog = document.getElementById('tweet-dialog');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCounter = document.getElementById('char-counter');
    const btnCopyTweet = document.getElementById('btn-copy-tweet');
    const btnPublishTweet = document.getElementById('btn-publish-tweet');

    // Current Tweet Draft state
    let currentTweetData = null;

    // Theme Selector Switch
    const themeCheckbox = document.getElementById('theme-checkbox');

    // Fetch and Load Feed
    async function loadFeed(isManualRefresh = false) {
        setLoadingState(true);
        try {
            const response = await fetch('/api/releases');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.success && data.releases) {
                cachedReleases = data.releases;
                updateStats();
                renderFeed();
                updateSyncTime();
                setLoadingState(false);
            } else {
                throw new Error(data.error || 'Failed to retrieve release notes.');
            }
        } catch (error) {
            console.error('Error loading release notes:', error);
            showErrorState(error.message);
        }
    }

    // Set UI Loading State
    function setLoadingState(isLoading) {
        if (isLoading) {
            feedLoader.removeAttribute('hidden');
            feedTimeline.style.opacity = '0.5';
            feedError.setAttribute('hidden', '');
            refreshSpinner.removeAttribute('hidden');
            btnRefresh.setAttribute('disabled', 'true');
        } else {
            feedLoader.setAttribute('hidden', '');
            feedTimeline.style.opacity = '1';
            refreshSpinner.setAttribute('hidden', '');
            btnRefresh.removeAttribute('disabled');
        }
    }

    // Set UI Error State
    function showErrorState(message) {
        feedLoader.setAttribute('hidden', '');
        feedTimeline.innerHTML = '';
        feedError.removeAttribute('hidden');
        errorMessage.textContent = message;
        refreshSpinner.setAttribute('hidden', '');
        btnRefresh.removeAttribute('disabled');
    }

    // Update Last Synced Time
    function updateSyncTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        syncTime.textContent = `Last synced: ${timeString}`;
    }

    // Compute and display stats counters
    function updateStats() {
        let totalCount = 0;
        let featureCount = 0;
        let breakingChangeCount = 0;
        let issueCount = 0;

        cachedReleases.forEach(entry => {
            entry.items.forEach(item => {
                totalCount++;
                const itemType = item.type.toLowerCase();
                if (itemType === 'feature') {
                    featureCount++;
                } else if (itemType === 'breaking' || itemType === 'change') {
                    breakingChangeCount++;
                } else if (itemType === 'issue') {
                    issueCount++;
                }
            });
        });

        statTotal.textContent = totalCount;
        statFeatures.textContent = featureCount;
        statBreaking.textContent = breakingChangeCount;
        statIssues.textContent = issueCount;
    }

    // Render feed based on filter & search state
    function renderFeed() {
        feedTimeline.innerHTML = '';
        
        let visibleEntriesCount = 0;

        cachedReleases.forEach(entry => {
            // Filter the items within this date entry
            const filteredItems = entry.items.filter(item => {
                // Filter tag match
                const matchesFilter = activeFilter === 'all' || 
                                     item.type.toLowerCase() === activeFilter.toLowerCase();
                
                // Search term match
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description;
                const plainText = (tempDiv.textContent || tempDiv.innerText || '').toLowerCase();
                const matchesSearch = !searchQuery || 
                                      plainText.includes(searchQuery.toLowerCase()) || 
                                      item.type.toLowerCase().includes(searchQuery.toLowerCase());
                
                return matchesFilter && matchesSearch;
            });

            // If there are visible items for this date, render the timeline group
            if (filteredItems.length > 0) {
                visibleEntriesCount += filteredItems.length;

                const groupEl = document.createElement('div');
                groupEl.className = 'timeline-group';

                const headerEl = document.createElement('header');
                headerEl.className = 'timeline-date-header';
                headerEl.textContent = entry.date;
                groupEl.appendChild(headerEl);

                const cardsGrid = document.createElement('div');
                cardsGrid.className = 'cards-grid';

                filteredItems.forEach(item => {
                    const cardEl = document.createElement('article');
                    // Class name based on type
                    const cleanType = item.type.toLowerCase();
                    cardEl.className = `update-card card-${cleanType}`;
                    
                    const badgeClass = `badge badge-${cleanType}`;
                    
                    cardEl.innerHTML = `
                        <div class="card-header">
                            <span class="${badgeClass}">${item.type}</span>
                            <span class="card-meta">${entry.date}</span>
                        </div>
                        <div class="card-body">
                            ${item.description}
                        </div>
                        <div class="card-footer">
                            <div class="card-footer-left">
                                <a href="${entry.link}" class="card-link" target="_blank" rel="noopener noreferrer">
                                    <span>Google Cloud Release Notes</span>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </a>
                            </div>
                            <button class="btn-tweet-card" aria-label="Tweet this update">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                </svg>
                                <span>Tweet</span>
                            </button>
                        `;
                    
                    // Attach event listener for tweeting this update
                    const tweetBtn = cardEl.querySelector('.btn-tweet-card');
                    tweetBtn.addEventListener('click', () => {
                        openTweetModal(entry.date, item.type, item.description, entry.link);
                    });

                    cardsGrid.appendChild(cardEl);
                });

                groupEl.appendChild(cardsGrid);
                feedTimeline.appendChild(groupEl);
            }
        });

        // Show empty state if no matches
        if (visibleEntriesCount === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'feed-loader';
            emptyEl.innerHTML = `
                <p style="color: var(--text-secondary); margin-bottom: 0;">No updates matches your search or filter criteria.</p>
            `;
            feedTimeline.appendChild(emptyEl);
        }
    }

    // Parse description and auto-draft a Twitter text (limit to 280 chars)
    function draftTweetText(date, type, descHtml, link) {
        // Strip HTML tags using browser utility
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = descHtml;
        
        let plainText = tempDiv.textContent || tempDiv.innerText || "";
        
        // Normalize whitespaces
        plainText = plainText.replace(/\s+/g, ' ').trim();
        
        const prefix = `📢 #BigQuery Update [${type}] (${date}): `;
        const suffix = `\n\nRead: ${link}`;
        
        // Calculate max allowed length for the body content
        // 280 limits on X
        const maxBodyLength = 280 - prefix.length - suffix.length;
        
        if (plainText.length > maxBodyLength) {
            plainText = plainText.substring(0, maxBodyLength - 3) + '...';
        }
        
        return `${prefix}${plainText}${suffix}`;
    }

    // Open Modal and Setup Tweet Editor
    function openTweetModal(date, type, descHtml, link) {
        const text = draftTweetText(date, type, descHtml, link);
        tweetTextarea.value = text;
        
        currentTweetData = { text, link };
        updateCharCounter();
        
        // HTML5 Dialog Open
        tweetDialog.showModal();
    }

    // Close Tweet Modal
    function closeTweetModal() {
        tweetDialog.close();
        btnCopyTweet.textContent = 'Copy Draft';
        btnCopyTweet.removeAttribute('disabled');
    }

    // Update Tweet character counter and apply limit styling
    function updateCharCounter() {
        const textLength = tweetTextarea.value.length;
        charCounter.textContent = `${textLength} / 280`;
        
        if (textLength > 280) {
            charCounter.classList.add('limit-danger');
            btnPublishTweet.setAttribute('disabled', 'true');
        } else {
            charCounter.classList.remove('limit-danger');
            btnPublishTweet.removeAttribute('disabled');
        }
    }

    // Event Listeners for UI interaction
    btnRefresh.addEventListener('click', () => loadFeed(true));
    btnRetry.addEventListener('click', () => loadFeed(true));
    
    // Search interaction
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchQuery.length > 0) {
            btnClearSearch.removeAttribute('hidden');
        } else {
            btnClearSearch.setAttribute('hidden', '');
        }
        renderFeed();
    });

    btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        btnClearSearch.setAttribute('hidden', '');
        renderFeed();
        searchInput.focus();
    });

    // Chip filtering
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Toggle active state
            filterChips.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-checked', 'false');
            });
            chip.classList.add('active');
            chip.setAttribute('aria-checked', 'true');
            
            activeFilter = chip.getAttribute('data-filter');
            renderFeed();
        });
    });

    // Dialog Modal Interactions
    btnCloseModal.addEventListener('click', closeTweetModal);
    
    // Close modal when clicking outside contents
    tweetDialog.addEventListener('click', (e) => {
        const rect = tweetDialog.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                            rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            closeTweetModal();
        }
    });

    // Handle typing inside textarea
    tweetTextarea.addEventListener('input', updateCharCounter);

    // Copy Draft Text helper
    btnCopyTweet.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(tweetTextarea.value);
            btnCopyTweet.textContent = 'Copied!';
            btnCopyTweet.setAttribute('disabled', 'true');
            setTimeout(() => {
                btnCopyTweet.textContent = 'Copy Draft';
                btnCopyTweet.removeAttribute('disabled');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            alert('Failed to copy to clipboard. Please copy manually.');
        }
    });

    // Publish tweet on Twitter/X Intent URL
    btnPublishTweet.addEventListener('click', () => {
        const text = encodeURIComponent(tweetTextarea.value);
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, '_blank');
        closeTweetModal();
    });

    // Theme Switcher Initialization & Handler
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeCheckbox) themeCheckbox.checked = true;
    }

    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light-theme');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Trigger initial load
    loadFeed();
});
