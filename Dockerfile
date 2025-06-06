FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (dev + prod)
RUN npm install

# Copy all source files
COPY . .

# Build the app (nest CLI is now available)
RUN npm run build

# Remove dev dependencies to slim image
RUN npm prune --production

EXPOSE 8080

CMD ["node", "dist/main"]
