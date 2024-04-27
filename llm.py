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

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

assert GROQ_API_KEY is not None
assert OPENAI_API_KEY is not None

### API request

groq_client = Groq(api_key=GROQ_API_KEY)
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)


def response(text, temperature=0.0, max_tokens=1024):
    '''
    Ask Groq to generate a JSON object given a prompt.
    '''
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
        response_format={"type": "json_object"}
    )
    return res.choices[0].message.content


def lat_long(lat, long):
    '''
    Ask Groq to describe a location.
    '''
    geo_data = get_nominatim(lat, long)

    prompt = f"""
        You are a helpful weather assistant.
        You present helpful geospatial data.
        Double-check the correctness of the data you provide.

        The location is:
        Latitude: {lat}
        Longitude: {long}
        City: {geo_data['city']}
        State: {geo_data['state']}
        Country: {geo_data['country']}
        
        Generate the following data for this location:
        * city: string
        * state: string
        * country: string
        * type of biome: string
        * type of vegetation (if any): string
        * type of forest (if any): string
        * average weather conditions (temperature): two numbers (summer/winter in Celsius, set variable names accordingly)
        * precipitation: one number (mm on average)
        
        Don't deviate from this format.
        If you deviate, you will be penalized.
    """
    return response(prompt)


### FastAPI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/lat_long/{lat}/{long}")
def llm_request(lat, long):
    '''
    Decode the JSON returned by Groq.
    '''
    response = lat_long(lat, long)
    return json.loads(response)


### OPENAI (GPT-4)


def encode_image(image_path):
    '''
    Encode an image in Base64.
    '''
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def image_mask_request(image_path="./image.png", mask_path="./mask.png"):
    '''
    Ask GPT-4 to analyze a satellite image and its associated mask.
    '''
    # Getting the base64 string
    base64_image = encode_image(image_path)
    base64_mask = encode_image(mask_path)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}",
    }

    # Setting the prompt
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
                        "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{base64_mask}"},
                    },
                ],
            }
        ],
        "max_tokens": 300,
        "response_format": {"type": "json_object"},
    }

    http_response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )
    response = http_response.json()
    response = response["choices"][0]["message"]["content"]

    return json.loads(response)


@app.post("/upload")
def upload(image: UploadFile, mask: UploadFile):
    '''
    Save the given images locally.
    Pass them to the LLM.
    '''
    try:
        # Reading from image
        contents = image.file.read()
        with open("image.png", "wb") as f:
            f.write(contents)

        # Reading from mask
        contents = mask.file.read()
        with open("mask.png", "wb") as f:
            f.write(contents)
    except Exception:
        return {"message": "There was an error uploading the files"}
    finally:
        image.file.close()
        mask.file.close()

    return image_mask_request(image_path="image.png", mask_path="mask.png")


@app.post("/upload")
def upload_img_to_llm(image: UploadFile):
    try:
        # Reading from image
        contents = image.file.read()
        with open("image.png", "wb") as f:
            f.write(contents)

    except Exception:
        return {"message": "There was an error uploading the files"}
    finally:
        image.file.close()

    return image_mask_request(image_path="image.png")


@app.get("/nominatim_test/{lat}/{long}")
def get_nominatim(lat, long):
    '''
    Get geospatial data from Nominatim.

    Take a latitude and a longitude.
    Return the city, state and country of that location.
    '''
    params = {
        "lat": lat,
        "lon": long,
        "accept-language": "en",
        # formats: json, geojson, geocodejson
        "format": "json",
    }

    response = requests.get(
        "https://nominatim.openstreetmap.org/reverse", params=params
    )
    parsed_response = json.loads(response.content)

    if parsed_response.get("error") == "Unable to geocode":
        return {"city": "not found", "state": "not found", "country": "not found"}

    parsed_address = parsed_response["address"]

    city = parsed_address.get("village", parsed_address.get("city"))
    state = parsed_address.get("state", parsed_address.get("county"))
    country = parsed_address.get("country")

    return {"city": city, "state": state, "country": country}


@app.get("/post_test")
def post_test():
    '''
    WARNING: Only used for testing purposes.
    Use your own POST method.
    '''
    url = "http://127.0.0.1:8000/upload"
    file = {
        "image": open("./example_image.png", "rb"),
        "mask": open("./example_mask.png", "rb"),
    }
    response = requests.post(url=url, files=file)
    # result = json.loads(response.json())
    result = response.json()
    return result
