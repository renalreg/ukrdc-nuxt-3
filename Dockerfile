FROM node:25-alpine as builder

# Environment variables used for building and Sentry release
ARG SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT

ARG GITHUB_SHA
ARG GITHUB_REF

WORKDIR /app

# Install all dependencies, including dev, and build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Start a fresh image
FROM node:25-alpine

# Set production environment variables
ENV NODE_ENV=production
ENV HOST="0.0.0.0"

# Install production dependencies
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy build output from previous step
COPY --from=builder /app/.output ./.output/
COPY ./start.sh ./start.sh

RUN chmod +x ./start.sh

CMD [ "./start.sh" ]