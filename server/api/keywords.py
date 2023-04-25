#!/usr/bin/env python3
import sys
import json
from keybert import KeyBERT

kw_model = KeyBERT(model='paraphrase-multilingual-MiniLM-L12-v2')

while True:
    inp = input()
    data = json.loads(inp)

    full_text = data["postData"]["text"]

    keywords = kw_model.extract_keywords(full_text,
                                         top_n=10)

    keywords_list = list(dict(keywords).keys())
    print(','.join(keywords_list))
    sys.stdout.flush()
