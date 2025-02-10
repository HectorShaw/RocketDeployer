FROM ubuntu:focal

# Update apt cache, install dependencies, and install Node.js
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl git && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install -g typescript && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /home/app

# Copy package files first for better caching
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy project files
COPY main.sh main.sh
COPY tsconfig.json tsconfig.json

# Compile TypeScript files
RUN tsc -b || { echo "TypeScript build failed"; exit 1; }

# Ensure required files are executable
RUN chmod +x main.sh && chmod +x dist/script.js || echo "dist/script.js not found"

# Set the entrypoint
ENTRYPOINT [ "/home/app/main.sh" ]
