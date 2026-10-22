import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api/v1", { exclude: ["health"] });
  app.enableCors({
    origin: config.get<string>("WEB_ORIGIN", "http://localhost:3000"),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();

  const port = Number.parseInt(config.get<string>("PORT", "3001"), 10);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
