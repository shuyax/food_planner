#!/bin/bash
docker stop foodplanner-dev-db foodplanner-test-db
docker rm foodplanner-dev-db foodplanner-test-db
echo "✅ Databases stopped and removed."
