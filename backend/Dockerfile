# --- build stage ----------------------------------------------------------
FROM golang:1.23-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags='-s -w' \
    -o /out/server ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags='-s -w' \
    -o /out/admin  ./cmd/admin
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags='-s -w' \
    -o /out/tenant ./cmd/tenant

# --- runtime stage --------------------------------------------------------
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app
COPY --from=build /out/server /app/server
COPY --from=build /out/admin  /app/admin
COPY --from=build /out/tenant /app/tenant
COPY migrations /app/migrations

USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app/server"]
