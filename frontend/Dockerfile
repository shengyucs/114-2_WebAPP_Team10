FROM node:20-alpine

WORKDIR /app

# Copy shared types
COPY shared ./shared

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Expose Vite default port
EXPOSE 5173

# Run Vite with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host"]
