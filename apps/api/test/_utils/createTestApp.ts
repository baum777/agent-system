import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { AppModule } from "../../src/app.module";

export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleRef.createNestApplication();
  await app.init();

  const request = supertest(app.getHttpServer());
  return { app, request };
}

