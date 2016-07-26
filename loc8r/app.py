
import json

from monkeylearn import MonkeyLearn
from flask import Flask, jsonify
import requests
from geopy.geocoders import GeoNames


app = Flask('loc8r')

entity_module_id = 'ex_isnnZRbS'
with open('../.ml_apikey', 'r') as f:
    apikey = f.read()
ml = MonkeyLearn(apikey)

geolocator = GeoNames(
    username='georeddit',
    timeout=3
)


@app.route("/r/<sub>/")
def entity(sub):
    reddit = requests.get(
        'http://www.reddit.com/r/{}.json'.format(sub),
        headers = {'User-agent': 'loc8rbot 0.0.1.0.1.a.a.a.b.k.h'}
    ).json()
    try:
        posts = reddit['data']['children']
    except KeyError:
        return jsonify(reddit)
    text_list = []
    for post in posts:
        try:
            text_list.append(post['data']['title'])
        except KeyError:
            print post
    res = ml.extractors.extract(entity_module_id, text_list)
    locations = []
    for locs, post in zip(res.result, posts):
        pc = json.loads(json.dumps(locs))
        for loc in pc:
            location = geolocator.geocode(loc['entity'], exactly_one=True)
            if not location:
                continue
            loc['lat'] = location.latitude
            loc['lng'] = location.longitude
            loc.update(post['data'])
            locations.append(loc)
    return jsonify({
        'reddit': reddit,
        'result': locations
    })

if __name__ == "__main__":
    app.run(debug=True)
