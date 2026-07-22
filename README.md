# Used Car ETL Dashboard

A modern, responsive, full-stack web application designed for learning ETL (Extract, Transform, Load) concepts using Python Flask and Vanilla JavaScript.

## Project Overview

The **Used Car ETL Dashboard** allows users to visualize, search, filter, and clean a dataset of used cars. It demonstrates how to handle raw data with intentional errors (like missing values, incorrect capitalization, or duplicate records) and clean it via a REST API.

## Features

- **Modern SaaS UI**: Premium design with CSS Grid, Flexbox, custom variables, and Dark Mode.
- **Data Visualizations**: Dashboard stats (Total Cars, Avg Price, Avg Mileage, etc.).
- **ETL Cleaning**: A one-click "Clean Dataset" button to sanitize dirty data through the Flask backend.
- **Live Search & Filter**: Search by brand/model/location and filter by multiple categories.
- **Pagination**: Built-in client-side pagination.
- **Exporting**: Download the data as CSV or JSON.

## Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla, ES6+). No frameworks used!
- **Backend**: Python 3, Flask.
- **Icons**: FontAwesome 6.
- **Fonts**: Google Fonts (Poppins).

## Folder Structure

```
DAY 1/
├── assets/          # (Optional) Images, logos
├── backend/
│   ├── app.py       # Flask API Server
│   └── requirements.txt
├── data/
│   └── cars_raw.json # Generated dirty dataset
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html   # Main Dashboard UI
├── generate_data.py # Script used to generate the dataset
└── README.md
```

## Installation & Setup

1. **Prerequisites**: Ensure you have Python installed.
2. **Install Backend Dependencies**:
   Open a terminal in the project directory and run:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. **Run the Flask Backend**:
   ```bash
   python backend/app.py
   ```
   The backend will start running at `http://127.0.0.1:5000`.

4. **Run the Frontend**:
   Simply open `frontend/index.html` in Google Chrome or any modern web browser. 

## API Documentation

The Flask backend provides the following REST APIs:

- `GET /cars`: Returns all raw car records.
- `GET /stats`: Returns total cars, average price, highest/lowest price, and average mileage.
- `GET /search?q={query}`: Searches cars by brand, model, or location.
- `GET /filter?brand={}&fuel={}&transmission={}&year={}`: Filters records.
- `POST /clean`: Cleans the dataset (removes duplicates, empty/0 values, normalizes text) and returns the sanitized JSON array.

## Learning Outcomes

By analyzing this project, beginners will learn:
- How to structure a Vanilla JS frontend and a Flask backend.
- How to make async `fetch()` calls to a REST API.
- How to manipulate the DOM dynamically.
- How to write modern CSS with variables and dark mode.
- Basic data cleaning principles (ETL Workflow).
