import sys
from keybert import KeyBERT

kw_model = KeyBERT(model='all-mpnet-base-v2')

args = sys.argv
if (len(args) != 2):
    raise SystemExit(2)

full_text = args[1]

keywords = kw_model.extract_keywords(full_text,
                                     top_n=5)

keywords_list = list(dict(keywords).keys())
print(','.join(keywords_list))
sys.stdout.flush()
