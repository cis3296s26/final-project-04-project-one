FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -Dmaven.test.skip=true

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/crazy8s-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 10000
CMD ["java", "-Dserver.port=10000", "-jar", "app.jar"]