# BigQuery Release Notes Explorer

A premium, modern web application that fetches, parses, and formats Google Cloud BigQuery release notes. It splits daily logs into individual updates, categorizes them, and provides a composer to share updates on X (Twitter).

---

## ✨ Features

- **Live RSS Fetching**: Dynamically retrieves the latest release notes from the official Google Cloud BigQuery Atom feed.
- **Granular Splitting**: Parses daily logs to isolate individual features, fixes, and announcements into distinct cards.
- **Vibrant Dark Theme**: Sleek slate design featuring modern typography, category badges, and glassmorphism styling.
- **Search & Filters**: Quick client-side filtering by category chips and live text search.
- **Social Composer**: Drafts X (Twitter) updates with hashtags and title links automatically formatted within X's 280-character limit.

---

## 🛠️ Tech Stack

- **Backend**: Python Flask
- **Frontend**: HTML5, Vanilla CSS3, Vanilla ES6 JavaScript
- **API Formats**: XML (Atom Feed input), JSON (client payload)

---

## 📂 Project Structure

- [app.py](file:///Users/eshu/Documents/agy-cli-projects/bq-releases-notes/app.py): Flask server, feed fetching logic, SSL bypasses, and XML processing logic.
- [templates/index.html](file:///Users/eshu/Documents/agy-cli-projects/bq-releases-notes/templates/index.html): Page layout, search inputs, analytics counter grid, and HTML5 dialog modal wrapper.
- [static/css/style.css](file:///Users/eshu/Documents/agy-cli-projects/bq-releases-notes/static/css/style.css): Global layout, animations, category colors, and custom scrollbar definitions.
- [static/js/app.js](file:///Users/eshu/Documents/agy-cli-projects/bq-releases-notes/static/js/app.js): Feed data fetch cache, category handlers, character counters, and clipboard/social helper modules.
- [requirements.txt](file:///Users/eshu/Documents/agy-cli-projects/bq-releases-notes/requirements.txt): Python dependency declarations.

---

## 🚀 Getting Started

### 📋 Prerequisites
- Python 3.7+ installed.
- Pip package manager installed.

### ⚙️ Installation & Run

1. Navigate to the project root directory:
   ```bash
   cd /Users/eshu/Documents/agy-cli-projects/bq-releases-notes
   ```

2. Install dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```

3. Launch the development server:
   ```bash
   python3 app.py
   ```

4. Access the application in your browser:
   **[http://127.0.0.1:5001](http://127.0.0.1:5001)**
