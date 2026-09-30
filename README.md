# Fake News Detector

Welcome to the Fake News Detector project! This project was created as part of my college coursework, and I'm excited to share it with the developer community. If you are interested in contributing to this project or using it as a basis for your own development, please read on.

## About FND

FND is a web-based application designed to detect fake news articles. It uses machine learning models to analyze news articles and predict whether they are real or fake. The goal of this project is to provide a tool that can help users identify unreliable news sources and combat the spread of misinformation.

## Features

- **Live News Monitoring:** View real-time predictions for news articles.
![live_monitoring](https://imgur.com/9BVijIo.png)

- **News Quiz:** Test your fake news detection skills by taking our news quiz.
![news_quiz](https://imgur.com/w0xmk5f.png)

- **Check News by Title:** Enter a news title to see if it's predicted as real or fake.
![check_title](https://imgur.com/YDrfDVT.png)

- **User Collaboration:** I encourage other developers to collaborate and improve this project further.

## Getting Started

To get started with this project, follow these steps:

1. Cloning the repository

`git clone https://github.com/DJDarkCyber/Fake-News-Detector`

2. Install the required libraries for python

`cd Fake-News-Detector/app/FakeNewsDetectorAPI/ && pip install -r requirements.txt`

3. Install the required libraries for js

`cd ../fake-news-detector-frontend && npm install`

4. Deployment

Open terminal and cd to project root folder and run

`cd app/FakeNewsDetectorAPI/ && python manage.py migrate && python manage.py runserver`

To load quiz data,

`python manage.py quiz_data_loader game_data/game_data.csv`

Open another terminal and cd to project root folder and run

`cd app/fake-news-detector-frontend/ && npm start`

All set if everything running without errors. Now the deployed web application should open in a browser. If not, open a browser and navigate to http://localhost:3000

## Roadmap

- **Enhanced Machine Learning Models:** Improve the accuracy of the fake news detection models.
- **User Profiles:** Allow users to create profiles and track their quiz scores.