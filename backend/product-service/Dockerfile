# STEP 1: Build Phase
FROM maven:3-amazoncorretto-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean install -DskipTests

# STEP 2: Run Phase
FROM amazoncorretto:21-alpine

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
