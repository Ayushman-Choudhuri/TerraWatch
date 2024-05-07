# TerraWatch: Deforestation Detection and Analysis Using Image Segmentation and Multimodal LLMs

## Concept

TerraWatch is a proof of concept system developed during the TUM AI Hackathon 2024 to detect deforestation from satellite images and reason out the causes and potential environmental effects using computer vision models and multimodal large language models.

Below is the youtube demo: 

<div align="center">
  <a href="https://www.youtube.com/watch?v=3_woHe52Zwk">
    <img src="https://img.youtube.com/vi/3_woHe52Zwk/0.jpg" alt="IMAGE ALT TEXT HERE">
  </a>
</div>

**Link to Full Video Demo on Youtube:** [Link](https://www.youtube.com/watch?v=3_woHe52Zwk)


## Architecture

![TerraWatch Architecture](./assets/architecture%20diagram.png)


## Segmentation Model

We used a traditional UNet to train the data on annotated sattelite images from Ukraine. The details of the segmentation model training and results will be uploaded soon. 

## Frontend

The frontend is built using React with Elements UI. The necessary dependencies need to be installed using npm.

```bash 
npm install
```

To start up the local frontend instance run the following command.

```bash
npm start
```

## Running the LLM

1. Get your own API keys! Put them in `.env`

2. Create a virtual environment for example using `virtualenv` and activate it
```bash
python -m virtualenv tum-ai
source tum-ai/bin/activate
```

3. Install all necessary dependencies into the newly created environment using pip
   
```bash
pip install -r requirements.txt
```

4. Start the local Flask API server using uvicorn
   
```bash
python -m uvicorn api:app --reload
```

The API is now accessible through the following endpoints
```url
GET /environmental-details/{latitude}/{longitude}
POST /deforestation
POST /segmentation
```

## Future Work 

1. Upgrade models: We would like to use ResUnet as it was observed that it achieves a faster training convergence desprite its high computational complexity. The residual connections present in its architecture facilitate information propagation and convergence speed. [reference](https://www.mdpi.com/2072-4292/13/24/5084)

2. Fine tune LLM models: The current LLM models have not been fine tuned and we would like to fine tune them based on available environmental datasets. 