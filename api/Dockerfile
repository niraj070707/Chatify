# api/Dockerfile
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code
COPY . .

# Expose the port the API runs on
EXPOSE 4000

# Command to run the API
CMD ["yarn", "start"]
