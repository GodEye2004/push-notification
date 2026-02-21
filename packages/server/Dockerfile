FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --stage

# Copy source code
COPY . .

COPY ../config/service-account-key.json ./config/service-account-key.json

# Exposure port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
