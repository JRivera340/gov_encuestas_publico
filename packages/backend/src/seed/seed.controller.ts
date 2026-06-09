import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly service: SeedService) {}

  @Post()
  run() {
    return this.service.run();
  }

  // Arreglo idempotente y NO destructivo del módulo PYBA.
  @Post('pyba')
  seedPyba() {
    return this.service.seedPyba();
  }
}
