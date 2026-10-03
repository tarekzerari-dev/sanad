import urllib.request
import json

req = urllib.request.Request('https://jsonblob.com/api/jsonBlob', method='POST')
req.add_header('Content-Type', 'application/json')
req.add_header('Accept', 'application/json')
req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
data = json.dumps({"sanad_last_update": 0}).encode('utf-8')

try:
    with urllib.request.urlopen(req, data=data) as response:
        print(response.getheader('Location'))
except Exception as e:
    print(e)
