# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

COPY package.json package-lock.json ./


RUN npm install

COPY . .


EXPOSE 8080

# Command to start the app
CMD ["npm", "start"]
