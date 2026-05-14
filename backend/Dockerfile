FROM node:20-alpine

WORKDIR /app

# Copy shared types first
COPY shared ./shared

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ ./

# Expose port and debug port
EXPOSE 5000
EXPOSE 9229

# Use dev script with debug flag for tsx
CMD ["npm", "run", "dev", "--", "--inspect=0.0.0.0:9229"]
