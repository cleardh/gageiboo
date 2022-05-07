#!/bin/bash
# heroku git:remote -a gageiboo
<<<<<<< HEAD
=======
git checkout main
git pull
>>>>>>> 7091baac47b4582e34e73aa8381685944dcc950c
git add . 
git commit -am "Deploying app to heroku"
git push heroku main