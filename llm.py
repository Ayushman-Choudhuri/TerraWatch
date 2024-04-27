import openai
from groq import Groq

import json

from dotenv import load_dotenv
import os

from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import base64
import requests

### Loading the keys

# my keys are in ~/Documents/TUMai-hackathon/openai-key

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

assert GROQ_API_KEY is not None
assert OPENAI_API_KEY is not None

print(f'OpenAI key length: {len(OPENAI_API_KEY)}')
print(f'Groq key length: {len(GROQ_API_KEY)}')

### API request

groq_client = Groq(api_key=GROQ_API_KEY)
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

def response(text, temperature=0.0,max_tokens=1024,json=False):
    text = text + "\nReturn a JSON object." if json else text
    res = groq_client.chat.completions.create(
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
        response_format= {"type": "json_object"} if json else None
    )
    return res.choices[0].message.content

def lat_long(lat, long):
    prompt = f"""
        You are a helpful weather assistant.
        You present helpful geospatial data.
        Double-check the correctness of the data you provide.

        The location is:
        Latitude: {lat}
        Longitude: {long}
        
        Generate the following data for this location:
        * country: string
        * type of biome: string
        * type of vegetation (if any): string
        * type of forest (if any): string
        * average weather conditions (temperature): two numbers (summer/winter in Celsius, set variable names accordingly)
        * precipitation: one number (mm on average)
        
        Don't deviate from this format.
        If you deviate, you will be penalized.
    """
    return response(prompt, json=True)

# print("This is a regular request to the model:")
# print(response("Give me a random number between 1 and 42.", temperature=2.0))
# print("This is a request for a latitude and longitude:")
# print(lat_long(45.1, 11.4))

### FastAPI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/lat_long/{lat}/{long}")
def llm_request(lat, long):
    response = lat_long(lat, long)
    return json.loads(response)

### OPENAI (GPT-4)

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

@app.get("/image")
def image_request():
    res = openai_client.chat.completions.create(

    model="gpt-4-turbo",
    messages=[
        {
          "role": "user",
          "content": [
            {"type": "text", "text": "What’s in this image?"},
            {
              "type": "image_url",
              "image_url": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
              },
            },
          ],
        }
    ],
    max_tokens=300,
    )

    return res.choices[0].message.content

@app.get("/local_image")
def local_image_request(image_path="./47.png"):
    # Getting the base64 string
    base64_image = encode_image(image_path)

    headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    # set prompt
    prompt = """
    You are a helpful deforestation expert.
    Describe this image.

    The colors represent the following:
    * Green - Forest
    * Red - Not forest (deforestation area)
    * Blue - Other (borders)

    What fraction of the image has been deforested?
    What might be the causes?
    What biome is this?

    Be succinct.
    Be factual. Double-check your claims.
    """

    payload = {
      "model": "gpt-4-turbo",
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt,
            },
            {
              "type": "image_url",
              "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
              }
            }
          ]
        }
      ],
      "max_tokens": 300
    }

    http_response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    response = http_response.json()
    response = response['choices'][0]['message']['content']

    return response

def image_mask_request(image_path="./image.png", mask_path="./mask.png"):
    # Getting the base64 string
    base64_image = encode_image(image_path)
    base64_mask = encode_image(mask_path)

    headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    # set prompt
    prompt = """
    You are a helpful deforestation expert.
    The first image is a satellite image of a forest area.
    The second image is a segmented mask where the colors represent the following:
    * Green - Forest
    * Red - Not forest (deforestation area)
    * Blue - Other (borders)

    Produce a JSON object with the following structure:
        * deforestation: number (fraction of deforested area)
        * fragmentation: number (0.0 is one chunk of deforested area, 1.0 is broken up into multiple regions)
        * causes: string (potential causes of deforestation in this area. provide 3 reasons, comma-separated.)
        * biome: string (type of biome)
        * patterns: string (deforestation patterns. is it in one chunk? or are there many small regions?)
        * deforestation_type: string (type of deforestation, e.g. dendritic)
        * use_of_land: string (what can one do with this land? is it suitable for agriculture?)
        * effect_on_environment: string (how does this influence the surrounding environment? what is the effect on the living species?)
        * species_affected: array[string] (what species are affected?)

    Be succinct.
    Be factual. Double-check your claims.
    No generic comments about deforestation in general. Describe the given images only.
    Adhere to the outlined format.
    If you don't follow this format, you will be penalized.
    """

    payload = {
      "model": "gpt-4-turbo",
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt,
            },
            {
              "type": "image_url",
              "image_url": {
                "url": f"data:image/png;base64,{base64_image}"
              }
            },
            {
              "type": "image_url",
              "image_url": {
                "url": f"data:image/png;base64,{base64_mask}"
              }
            }
          ]
        }
      ],
      "max_tokens": 300,
      "response_format": {"type": "json_object"}
    }

    http_response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    response = http_response.json()
    response = response['choices'][0]['message']['content']

    return response

@app.post("/upload")
def upload(image: UploadFile, mask: UploadFile):
    try:
        # Reading from image
        contents = image.file.read()
        with open('image.png', 'wb') as f:
            f.write(contents)

        # Reading from mask
        contents = mask.file.read()
        with open('mask.png', 'wb') as f:
            f.write(contents)
    except Exception:
        return {"message": "There was an error uploading the files"}
    finally:
        image.file.close()
        mask.file.close()

    # return {"filename": image.filename}
    # return {"message": "Success"}
    return image_mask_request(image_path='image.png', mask_path='mask.png')

@app.get("/post_test")
def post_test():
    url = 'http://127.0.0.1:8000/upload'
    file = {'image': open('./example_image.png', 'rb'),
            'mask': open('./example_mask.png', 'rb'),
        }
    response = requests.post(url=url, files=file)
    result = json.loads(response.json())
    return result

@app.get("/nominatim_test/{lat}/{long}")
def get_nominatim(lat, long):
    params = {
        'lat': lat,
        'lon': long,
        # formats: json, geojson, geocodejson
        'format': 'json'
    }

    response = requests.get('https://nominatim.openstreetmap.org/reverse', params=params)
    return json.loads(response.content)
