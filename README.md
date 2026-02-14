# food_planner
## Migrate data seed to database based on env
NODE_ENV=production node database/migrate.js --- switch the env among: test, development, production
## How to connect to test/dev/prod database
psql -U username -d database_name -h localhost -p env_port
## How to build a node docker file for backend
cd backend
docker build -t your_docker_name . --build from the current directory
docker images ---check the image of the docker container built
./backend_docker_server.sh prod --- run the backend server docker container with environment