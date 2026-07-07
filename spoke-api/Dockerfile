# ---------- Stage 1: build the jar with Maven ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only the pom first and download dependencies, so this expensive
# layer is reused as long as pom.xml doesn't change.
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Now copy the sources and build (tests are skipped; run them in CI instead)
COPY src ./src
RUN mvn -B package -DskipTests

# ---------- Stage 2: slim runtime image ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Run as a non-root user
RUN useradd --system --create-home spoke
USER spoke

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Default to the prod profile; override with -e SPRING_PROFILES_ACTIVE=dev
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]
