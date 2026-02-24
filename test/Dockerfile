FROM python:3.12-slim

WORKDIR /tests

# Install Chromium & ChromeDriver
RUN apt-get update && apt-get install -y \
    chromium chromium-driver curl unzip && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy test code
COPY . .

# Default command (can be overridden by docker-compose)
CMD ["pytest", "-s", "tests"]