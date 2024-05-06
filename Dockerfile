FROM node:22-alpine as builder

# Environment variables used for building and Sentry release
ARG SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT

ARG GITHUB_SHA
ARG GITHUB_REF

# Install all dependencies, including dev, and build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Start a fresh image
FROM node:22-alpine

# Set production environment variables
ENV HOST="0.0.0.0"

# Install production dependencies
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy build output from previous step
COPY . .
COPY --from=builder /app/.output ./.output/

CMD [ "./start.sh" ]