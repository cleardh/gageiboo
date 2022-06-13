#!/bin/bash
# heroku git:remote -a gageiboo
git checkout main
git pull
git add . 
git commit -am "Deploying app to heroku"
git push heroku main
git checkout feature/mainPage