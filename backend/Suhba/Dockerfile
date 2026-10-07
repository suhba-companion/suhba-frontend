# ── Build stage ────────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Cache dependency layer before copying source
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn package -DskipTests -B && \
    mv target/*.jar app.jar

# ── Runtime stage ───────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/app.jar app.jar
EXPOSE 8080
# Default to the prod profile so the session cookie is SameSite=None; Secure
# (required for the cross-site admin panel). Overridable via SPRING_PROFILES_ACTIVE
# (e.g. docker-compose sets it for local runs).
ENV SPRING_PROFILES_ACTIVE=prod
# Without a heap ceiling the JVM sizes itself from the host, overshoots the
# container limit and gets OOM-killed, which looks identical to a crash. Exit on
# OOM rather than limping on in an unrecoverable state.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]
