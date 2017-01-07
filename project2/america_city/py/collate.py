import csv
import json

data = {}

alias = {
"new york city": "New York"
}

def proc_data(index):
    with open("final_datasets/"+index+".csv", "rU") as csvfile:
        rank = 1
        reader = csv.DictReader(csvfile, fieldnames=['city', 'state', 'val'])

        to_normalize = []

        for row in reader:
            city = row['city']
            city_key = row['city'].lower()
            state = row['state']

            if city_key in alias:
                city = alias[city_key]
                city_key = city.lower()

            if city_key not in data:
                data[city_key] = {}
                data[city_key]["display_name"] = city+", "+state

            data[city_key][index] = rank

            to_normalize.append(data[city_key])

            rank += 1

        for city in to_normalize:
            city[index] = 1.0 - (float(city[index]-1)/float(rank-1))

proc_data("career")
proc_data("nightlife")
proc_data("democratic")
proc_data("republican")
proc_data("transit")
proc_data("weather")
#print data

#TODO: fix politics index

potential_count = 0
final_cities = {}

for city, info in data.iteritems():
    num_hit = 0
    missing = {}

    for index in ["career", "nightlife", "democratic", "republican", "transit", "weather"]:
        missing[index] = True
        if index in info:
            missing[index] = False
            num_hit += 1

    if num_hit >= 5:
        potential_count += 1
        if num_hit == 6:
            print info['display_name']+" has ALL!"
            final_cities[city] = info
        else:
            print info['display_name']+" is missing: "
            for k,v in missing.iteritems():
                if v:
                    print " - "+k

print "Candidate cities: "+str(potential_count)

with open("final_datasets/locations.csv", "rU") as csvfile:
    reader = csv.DictReader(csvfile, fieldnames=['city', 'state', 'lat', 'long'])

    for row in reader:
        city_key = row['city'].lower()

        final_cities[city_key]['lat'] = row['lat']
        final_cities[city_key]['long'] = row['long']

with open("city_data.json", "w") as jsondump:
    jsondump.write(json.dumps(final_cities))
