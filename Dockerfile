# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /opt/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=build /opt/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
