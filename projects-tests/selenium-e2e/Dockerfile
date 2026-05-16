FROM eclipse-temurin:23-jdk

WORKDIR /workspace

# Browser + utilities required for headless Selenium execution.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        chromium \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Keep Chromium path explicit for Selenium options in containerized runs.
ENV CHROME_BIN=/usr/bin/chromium

COPY . .

RUN chmod +x mvnw
