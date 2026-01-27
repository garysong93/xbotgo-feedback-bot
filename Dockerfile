FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port (not needed for Discord bot but good practice)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
