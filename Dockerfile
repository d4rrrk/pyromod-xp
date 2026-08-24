FROM node:18-bullseye

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g typescript

# Copy source code and config
COPY . .

# Build the TypeScript code (creates /app/build)
RUN tsc

# Start the compiled bot
# We assume the main file inside src was named 'index.ts',
# so it becomes 'index.js' inside the build folder.
CMD ["node", "build/index.js"]
