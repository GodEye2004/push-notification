FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Exposure port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
