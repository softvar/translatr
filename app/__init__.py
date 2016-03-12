'''

=====================
(c) Varun Malhotra 2015
http://softvar.github.io
Source Code: https://github.com/softvar/
------------
LICENSE: MIT
--------
'''
# -*- coding: utf-8 -*-

from flask import json
from flask import Flask
from flask import request
from flask import render_template

import requests

app = Flask(__name__)

def translate(text_to_translate, to_language='auto', from_langage='auto'):
	agents = {'User-Agent':"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30)"}
	before_trans = 'class="t0">'
	link = "http://translate.google.com/m?hl=%s&sl=%s&q=%s" % (to_language, from_langage, text_to_translate.replace(" ", "+"))
	#### urllib2 way
	#request = urllib2.Request(link, headers=agents)
	#page = urllib2.urlopen(request).read()

	request = requests.get(link, headers=agents)
	page = request.text
	result = page[page.find(before_trans) + len(before_trans):]
	result = result.split("<")[0]
	return result

@app.route('/')
def my_form():
	return render_template('index.html')

@app.route('/', methods=['POST'])
def my_form_post():
	'''
	receive submitted data and process
	'''
	params = request.data
	params = json.loads(params)


	text = params['userText']
	langs = params['l']

	data = {
		'langs': langs,
		'strings': [{
			'text': text,
			'desc': 'text'
		}]
	}

	res = {}

	for str in range(0, len(data['strings'])):
		res[data['strings'][str]['desc']] = {}

		for lang in range(0, len(data['langs'])):
			res[data['strings'][str]['desc']][data['langs'][lang]['locale']] = translate(data['strings'][str]['text'], data['langs'][lang]['locale'])

	return json.dumps({'translatedText': res})

if __name__ == '__main__':
	app.run(debug=True, port=8000)
