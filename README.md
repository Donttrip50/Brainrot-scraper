# Brainrot Market Checker

A website that scrapes Eldorado.gg listings and calculates average prices.

## Features

- Search brainrot values
- Optional mutation filtering
- Average market price
- Lowest and highest listing
- Currency conversion
- Modern dark UI
- Full backend scraper

---

## Setup

### 1. Install Node.js
https://nodejs.org

### 2. Open terminal

Go inside the project folder.

### 3. Install dependencies

npm install

### 4. Install Playwright browser

npx playwright install

### 5. Create .env file

Copy:

.env.example

Rename to:

.env

### 6. Start server

npm start

### 7. Open website

http://localhost:3000

---

## Notes

Eldorado.gg may change HTML structure anytime.
If scraping stops working:
- update selectors
- add delays
- use proxies if rate-limited

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express
- Playwright