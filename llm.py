import openai
from groq import Groq

# import matplotlib.pyplot as plt
# import numpy as np
# import pandas as pd

import json

from dotenv import load_dotenv
import os

load_dotenv()
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

print(len(os.getenv('OPENAI_API_KEY')))
print(len(os.getenv('GROQ_API_KEY')))

