# Use a more recent Node.js version
FROM node:18-alpine

# Set the working directory in the Docker container
WORKDIR /app

# Update npm to the latest version
RUN npm install -g npm@10.7.0

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on
EXPOSE 3001

# Command to run your app
CMD ["node", "src/app.js"]
