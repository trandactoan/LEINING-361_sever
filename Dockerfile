# Use an official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the app and build it
COPY . .
RUN npm run build

# App runs on port 3000
EXPOSE 3000

# Start the app
CMD ["node", "dist/main"]
