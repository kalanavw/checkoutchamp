# Use an official Nginx image as the base
FROM nginx:alpine
LABEL authors="kalanaweerarathne"

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove the default Nginx static files
RUN rm -rf ./*

# Copy the React Vite build output to the Nginx public directory
COPY dist/ .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

#docker-compose up --build -d
