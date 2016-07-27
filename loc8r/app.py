
import json

from monkeylearn import MonkeyLearn
from flask import Flask, jsonify, send_from_directory
import requests
from geopy.geocoders import GeoNames


app = Flask('loc8r')

entity_module_id = 'ex_isnnZRbS'
with open('../.ml_apikey', 'r') as f:
    apikey = f.read().replace('\n','')
ml = MonkeyLearn(apikey)

geolocator = GeoNames(
    username='georeddit',
    timeout=3
)


@app.route("/svc/r/<sub>/")
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
            pass
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


@app.route('/')
@app.route('/<path:path>')
def root(path=None):
    return app.send_static_file('index.html')

if __name__ == "__main__":
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
