import json
import random
import os

brands_models = {
    "Toyota": ["Camry", "Corolla", "RAV4", "Highlander"],
    "Honda": ["Civic", "Accord", "CR-V", "Pilot"],
    "Ford": ["Mustang", "F-150", "Escape", "Explorer"],
    "Chevrolet": ["Silverado", "Equinox", "Malibu", "Tahoe"],
    "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder"],
    "BMW": ["3 Series", "5 Series", "X3", "X5"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"],
    "Audi": ["A3", "A4", "Q5", "Q7"],
    "Volkswagen": ["Jetta", "Passat", "Tiguan", "Atlas"],
    "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe"],
    "Kia": ["Forte", "Optima", "Sportage", "Sorento"],
    "Subaru": ["Impreza", "Outback", "Forester", "Crosstrek"],
    "Mazda": ["Mazda3", "Mazda6", "CX-5", "CX-9"],
    "Lexus": ["IS", "ES", "RX", "NX"],
    "Jeep": ["Wrangler", "Cherokee", "Grand Cherokee", "Compass"],
    "Ram": ["1500", "2500", "3500", "ProMaster"],
    "GMC": ["Sierra 1500", "Terrain", "Acadia", "Yukon"],
    "Dodge": ["Charger", "Challenger", "Durango", "Journey"],
    "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
    "Porsche": ["911", "Cayenne", "Macan", "Panamera"],
    "Volvo": ["S60", "XC40", "XC60", "XC90"],
    "Acura": ["ILX", "TLX", "RDX", "MDX"],
    "Infiniti": ["Q50", "Q60", "QX50", "QX80"],
    "Cadillac": ["CT4", "CT5", "XT4", "Escalade"],
    "Lincoln": ["Corsair", "Nautilus", "Aviator", "Navigator"],
    "Land Rover": ["Range Rover", "Defender", "Discovery", "Evoque"],
    "Jaguar": ["XE", "XF", "F-PACE", "F-TYPE"],
    "Mitsubishi": ["Mirage", "Outlander", "Eclipse Cross", "Outlander Sport"],
    "Mini": ["Cooper", "Countryman", "Clubman", "Convertible"],
    "Alfa Romeo": ["Giulia", "Stelvio", "4C", "Tonale"],
    "Fiat": ["500", "500X", "500L", "124 Spider"],
    "Genesis": ["G70", "G80", "G90", "GV80"],
    "Maserati": ["Ghibli", "Levante", "Quattroporte", "GranTurismo"],
    "Aston Martin": ["Vantage", "DB11", "DBS", "DBX"],
    "Bentley": ["Continental GT", "Flying Spur", "Bentayga", "Mulsanne"],
    "Rolls-Royce": ["Ghost", "Phantom", "Cullinan", "Wraith"],
    "Ferrari": ["488 GTB", "F8 Tributo", "Roma", "Portofino"],
    "Lamborghini": ["Huracan", "Aventador", "Urus", "Gallardo"],
    "McLaren": ["570S", "720S", "GT", "Artura"],
    "Bugatti": ["Chiron", "Veyron", "Divo", "Centodieci"],
    "Lotus": ["Evora", "Emira", "Exige", "Elise"],
    "Suzuki": ["Swift", "Vitara", "Jimny", "Ignis"],
    "Peugeot": ["208", "308", "2008", "3008"],
    "Renault": ["Clio", "Megane", "Captur", "Kadjar"],
    "Citroen": ["C3", "C4", "C5 Aircross", "Berlingo"],
    "Skoda": ["Octavia", "Superb", "Kodiaq", "Karoq"],
    "Seat": ["Ibiza", "Leon", "Arona", "Ateca"],
    "Dacia": ["Sandero", "Duster", "Logan", "Jogger"],
    "Vauxhall": ["Corsa", "Astra", "Mokka", "Crossland"],
    "Chrysler": ["300", "Pacifica", "Voyager", "PT Cruiser"]
}

locations = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]
fuels = ["Gasoline", "Diesel", "Electric", "Hybrid"]
transmissions = ["Automatic", "Manual"]

cars = []

# Generate 100 base records
for i in range(1, 101):
    brand = random.choice(list(brands_models.keys()))
    model = random.choice(brands_models[brand])
    year = random.randint(2010, 2024)
    price = random.randint(5000, 50000)
    mileage = random.randint(1000, 150000)
    fuel = random.choice(fuels)
    transmission = random.choice(transmissions)
    owner = random.randint(1, 4)
    location = random.choice(locations)
    
    car = {
        "id": i,
        "brand": brand,
        "model": model,
        "year": year,
        "price": price,
        "mileage": mileage,
        "fuel": fuel,
        "transmission": transmission,
        "owner": owner,
        "location": location
    }
    
    # Introduce bad data intentionally
    bad_luck = random.random()
    if bad_luck < 0.05:
        car["brand"] = "" # Missing brand
    elif bad_luck < 0.10:
        car["price"] = 0 # Invalid price
    elif bad_luck < 0.15:
        car["mileage"] = 0 # Invalid mileage
    elif bad_luck < 0.20:
        car["fuel"] = "" # Missing fuel
    elif bad_luck < 0.25:
        car["brand"] = "  " + car["brand"] + "  " # Extra spaces
        car["model"] = car["model"].lower() # Bad capitalization
    elif bad_luck < 0.28:
        # duplicate this record
        cars.append(car.copy())
    
    cars.append(car)

random.shuffle(cars)

os.makedirs('data', exist_ok=True)
# Write to JSON
with open('data/cars_raw.json', 'w') as f:
    json.dump(cars, f, indent=4)

print(f"Generated {len(cars)} records with intentional bad data in data/cars_raw.json")
