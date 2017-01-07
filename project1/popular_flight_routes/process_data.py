import csv
import json

airports = {}
routes = []
sorted_airports = set()

MAX_ROUTES = 100

with open("airports.csv", "rb") as csvfile:
    reader = csv.DictReader(csvfile, fieldnames=['id', 'city', 'state', 'country', 'code', 'code2', 'latitude', 'longitude'])

    for row in reader:
        airports[row['code']] = {
            "location": [float(row['longitude']), float(row['latitude'])],
            "passengers": 0,
        }

min_vol = 0.0
max_vol = 0.0
min_airport = 0.0
max_airport = 0.0
min_price = 0.0
max_price = 0.0

with open("routes.csv", "rb") as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        try:
            row['vol'] = float(row['vol'].replace(',', ''))
            row['avg_fare'] = float(row['avg_fare'].replace(',', '').replace('$', ''))
            row['dist'] = float(row['dist'].replace(',', ''))
            row['price_per_mile'] = row['avg_fare'] / row['dist']

            if row['vol'] > 100:
                try:
                    row['airport1'] = airports[row['city1']]
                except KeyError:
                    print "No data for airport "+row['city1']
                    continue

                try:
                    row['airport2'] = airports[row['city2']]
                except KeyError:
                    print "No data for airport "+row['city2']
                    continue

                airports[row['city1']]['passengers'] += row['vol']
                airports[row['city2']]['passengers'] += row['vol']

                routes.append(row)
        except ValueError:
            print "Could not convert string \""+row['vol']+"\" to float"

routes = sorted(routes, key=lambda rt: rt['vol'], reverse=True)

routes = routes[:MAX_ROUTES]

for row in routes:
    min_vol = min(min_vol, row['vol']) if min_vol > 0 else row['vol']
    max_vol = max(max_vol, row['vol'])

    min_price = min(min_price, row['price_per_mile']) if min_price > 0 else row['price_per_mile']
    max_price = max(max_price, row['price_per_mile'])

    for i in [1,2]:
        min_airport = min(min_airport, row['airport'+str(i)]['passengers']) if min_airport > 0 else row['airport'+str(i)]['passengers']
        max_airport = max(max_airport, row['airport'+str(i)]['passengers'])

        sorted_airports.add(row['city'+str(i)])

sorted_airports = sorted(sorted_airports, key=lambda x: airports[x]['passengers'], reverse=True)

with open("processed_routes.json", "w") as csvfile:
    csvfile.write(json.dumps({
        'routes': routes,
        'airports': airports,
        'sorted_airports': sorted_airports,
        'min_vol': min_vol,
        'max_vol': max_vol,
        'min_price': min_price,
        'max_price': max_price,
        'min_airport': min_airport,
        'max_airport': max_airport
    }))
    csvfile.close()
