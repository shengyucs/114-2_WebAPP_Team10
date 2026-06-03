# ============================================================
# Stage 1: Build the React frontend
# ============================================================
FROM node:20-alpine AS stage1

WORKDIR /app

# Copy shared TypeScript types referenced by frontend source
COPY shared/ ./shared/

# Copy package files first to leverage Docker layer caching
COPY frontend/package*.json ./frontend/

# Install all frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy frontend source and build (outputs to /app/frontend/dist)
COPY frontend/ ./
RUN npm run build

# ============================================================
# Stage 2: Compile the Node.js backend
# ============================================================
FROM node:20-alpine AS stage2

WORKDIR /app

# Copy shared TypeScript types; rootDir ".." in tsconfig resolves to /app
COPY shared/ ./shared/

# Copy package files first to leverage Docker layer caching
COPY backend/package*.json ./backend/

# Install all backend dependencies (including devDependencies for tsc)
WORKDIR /app/backend
RUN npm ci

# Copy backend source and compile TypeScript to /app/backend/dist
COPY backend/ ./
RUN npm run build

# ============================================================
# Stage 3: Production runner — no dev dependencies, minimal image
# ============================================================
FROM node:20-alpine

# Runtime environment configuration
ENV NODE_ENV=production
ENV PORT=5000
ENV FRONTEND_BUILD_PATH=/app/frontend/dist

# Copy package files and install production dependencies only
COPY backend/package*.json /app/backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy compiled frontend assets from stage 1
COPY --from=stage1 /app/frontend/dist /app/frontend/dist

# Copy compiled backend code from stage 2
COPY --from=stage2 /app/backend/dist /app/backend/dist

EXPOSE 5000

CMD ["node", "dist/backend/src/index.js"]
