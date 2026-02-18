import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return "SOC 2 Compliance API";
  }

  @Get("health")
  getHealth(): { status: string } {
    return { status: "ok" };
  }
}
