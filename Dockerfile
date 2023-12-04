FROM node:21-alpine as builder

# Environment variables used for building and Sentry release
ARG SENTRY_DSN
ARG GITHUB_SHA
ARG GITHUB_REF

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:21-alpine

ENV HOST="0.0.0.0"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY . .
COPY --from=builder /app/.output ./.output/

CMD [ "./start.sh" ]