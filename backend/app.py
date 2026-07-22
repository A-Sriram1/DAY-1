import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'cars_raw.json')

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

@app.route('/cars', methods=['GET'])
def get_cars():
    cars = load_data()
    return jsonify(cars)

@app.route('/stats', methods=['GET'])
def get_stats():
    cars = load_data()
    
    # Calculate stats filtering out bad numeric data for accuracy if needed, 
    # but the instructions imply doing it on current data.
    # We will ignore 0 price or mileage for min/avg calculations if we want realistic stats,
    # or just include them to show bad data affects stats.
    # Let's filter out 0s for stats to not ruin the average, or include them?
    # "Average Price", "Highest Price", "Lowest Price", "Average Mileage"
    
    valid_prices = [c['price'] for c in cars if isinstance(c.get('price'), (int, float)) and c['price'] > 0]
    valid_mileages = [c['mileage'] for c in cars if isinstance(c.get('mileage'), (int, float)) and c['mileage'] > 0]
    
    stats = {
        "total_cars": len(cars),
        "average_price": round(sum(valid_prices) / len(valid_prices), 2) if valid_prices else 0,
        "highest_price": max(valid_prices) if valid_prices else 0,
        "lowest_price": min(valid_prices) if valid_prices else 0,
        "average_mileage": round(sum(valid_mileages) / len(valid_mileages), 2) if valid_mileages else 0
    }
    
    return jsonify(stats)

@app.route('/search', methods=['GET'])
def search_cars():
    query = request.args.get('q', '').lower()
    cars = load_data()
    
    if not query:
        return jsonify(cars)
        
    filtered_cars = [
        c for c in cars
        if query in str(c.get('brand', '')).lower() 
        or query in str(c.get('model', '')).lower() 
        or query in str(c.get('location', '')).lower()
    ]
    return jsonify(filtered_cars)

@app.route('/filter', methods=['GET'])
def filter_cars():
    brand = request.args.get('brand')
    fuel = request.args.get('fuel')
    transmission = request.args.get('transmission')
    year = request.args.get('year')
    
    cars = load_data()
    
    if brand:
        cars = [c for c in cars if str(c.get('brand', '')).strip().lower() == brand.lower()]
    if fuel:
        cars = [c for c in cars if str(c.get('fuel', '')).strip().lower() == fuel.lower()]
    if transmission:
        cars = [c for c in cars if str(c.get('transmission', '')).strip().lower() == transmission.lower()]
    if year:
        cars = [c for c in cars if str(c.get('year', '')) == str(year)]
        
    return jsonify(cars)

@app.route('/clean', methods=['POST'])
def clean_data():
    """
    Cleaning Rules
    Remove duplicate records.
    Remove empty values.
    Remove missing brand.
    Remove missing fuel.
    Remove price = 0.
    Remove mileage = 0.
    Trim spaces.
    Normalize capitalization.
    Return cleaned JSON.
    """
    cars = load_data()
    cleaned_cars = []
    seen = set()
    
    for c in cars:
        # Check missing or empty brand/fuel
        brand = str(c.get('brand', '')).strip()
        fuel = str(c.get('fuel', '')).strip()
        
        if not brand or not fuel:
            continue
            
        # Check price and mileage
        price = c.get('price', 0)
        mileage = c.get('mileage', 0)
        
        if price <= 0 or mileage <= 0:
            continue
            
        # Transform: Trim spaces and normalize capitalization
        # Brand: Capitalize first letter
        c['brand'] = brand.title()
        
        # Model: Capitalize first letter of each word
        c['model'] = str(c.get('model', '')).strip().title()
        
        c['fuel'] = fuel.title()
        c['transmission'] = str(c.get('transmission', '')).strip().title()
        c['location'] = str(c.get('location', '')).strip().title()
        
        # Remove duplicates based on all fields
        car_tuple = (
            c['brand'], c['model'], c['year'], c['price'], 
            c['mileage'], c['fuel'], c['transmission'], 
            c['owner'], c['location']
        )
        
        if car_tuple not in seen:
            seen.add(car_tuple)
            cleaned_cars.append(c)
            
    # Return cleaned data
    return jsonify(cleaned_cars)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
