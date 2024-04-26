import openai
from groq import Groq

# import matplotlib.pyplot as plt
# import numpy as np
# import pandas as pd

import json

from dotenv import load_dotenv
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Loading the keys

load_dotenv()
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

assert GROQ_API_KEY is not None
assert OPENAI_API_KEY is not None

print(f'OpenAI key length: {len(OPENAI_API_KEY)}')
print(f'Groq key length: {len(GROQ_API_KEY)}')

# API request

client = Groq(api_key=GROQ_API_KEY)

def response(text, temperature=0.0,max_tokens=1024,json=False):
    res = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": text,
            }
        ],
        model="llama3-70b-8192",
        # model="llama3-8b-8192",
        temperature=temperature,
        max_tokens=max_tokens,
        #response_format= {"type": "json_object"}
    )
    return res.choices[0].message.content

print(response("Give me a random number between 1 and 42.", temperature=2.0))


