FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist ./dist

# Set environment variables (can be overridden at runtime)
ENV DATETIME_FORMAT=iso
ENV TIMEZONE=UTC

# Run the server
CMD ["node", "dist/index.js"]