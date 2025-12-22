# Use official Node.js lts image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache for dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the Vite development port
EXPOSE 5173

# Run the development server
# --host is required to expose the server outside the container
CMD ["npm", "run", "dev", "--", "--host"]
