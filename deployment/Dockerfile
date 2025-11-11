# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose backend port (adjust if not 5000)
EXPOSE 5000

# Set environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"] 