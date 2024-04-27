# TUM_AI_24_Hackathon

## Running the LLM

1. Get the API keys! Put them in `.env` (don't worry, it's `gitignore`d).

2. Create a virtual environment (I use `virtualenv`).
```bash
python -m virtualenv tumai
source tumai/bin/activate
```

3. Inside the environment, run:
```bash
pip install -r requirements.txt
```
The dependencies are installed. 

4. To start the server, run
```bash
python -m uvicorn index:app --reload
```

5. The API is now accessible through
```url
http://localhost:8000/llm/{latitude}/{longitude}
```
