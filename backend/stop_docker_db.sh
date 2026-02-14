#!/bin/bash
environment=$1 # dev, test, prod
docker stop foodplanner-$environment-db
docker rm foodplanner-$environment-db
echo "✅ Databases $environment stopped and removed."
