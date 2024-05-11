# Use the official Node.js 16 as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in package.json
RUN npm install --production

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Run the app when the container launches
CMD ["node", "src/app.js"]
# docker run -p 3001:3001 -d          
# docker run -d --name cover-letter-app cover-letter-generator:latest

# docker run -p 3001:3001 -d cover-letter-generator:latest