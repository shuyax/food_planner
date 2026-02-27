# food_planner
install docker, docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl status docker 
sudo usermod -aG docker $USER ---Optional: Allow your user to run Docker without sudo; Need to log out and log back in 

## How to connect to test/dev/prod database
psql -U username -d database_name -h localhost -p env_port

## How to build and run all containers based on environment
### If frontend source code changed, need to run npm run build to rebuild the build directory which is mounted to the frontend container
cd food_planner
docker compose --env-file ./backend/.env.test up --build 
    ---switch among env

## How to run selenium test manually
cd food_planner
docker compose --env-file backend/.env.dev run --rm selenium_test "
  curl -X POST http://backend:4000/test/reset-db &&
  pytest -v -s tests 2>&1 | tee /logs/selenium_test.log
"

## How to stop containers when done - Stops backend, frontend, and postgres (if running detached).
---docker-compose --env-file ./backend/.env.dev down

## How to run a docker container in terminal
docker exec -it CONTAINER_ID /bin/bash