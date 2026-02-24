environment=$1 # dev, test, prod
if [ $environment = "test" ]; then
    env="test"
elif [ $environment = "dev" ]; then
    env="development"
elif [ $environment = "prod" ]; then
    env="production"
else
    echo "Invalid environment"
fi

docker run -p 4000:4000 \
    -v "$PWD":/app \
    -e NODE_ENV=$env \
    foodplanner_backend