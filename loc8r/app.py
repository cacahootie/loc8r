
from monkeylearn import MonkeyLearn
from flask import Flask, jsonify

app = Flask('loc8r')
with open('../.ml_apikey', 'r') as f:
    apikey = f.read()
ml = MonkeyLearn(apikey)

text_list = ["This is a text to test your classifier", "This is some more text"]
entity_module_id = 'ex_isnnZRbS'

@app.route("/")
def entity():
    res = ml.extractors.extract(module_id, text_list)
    return jsonify(res.result)

if __name__ == "__main__":
    app.run(debug=True)
