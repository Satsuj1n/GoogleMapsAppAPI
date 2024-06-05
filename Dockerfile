# Use the official latest Node.js image as the base
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application's dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Ensure the .vite directory has the correct permissions
RUN mkdir -p node_modules/.vite && chown -R node:node /app

# Switch to a non-root user
USER node

# Expose the port that the application will run on
EXPOSE 5173

# Define the command to start the application
CMD ["npm", "run", "dev"]
