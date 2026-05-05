import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly service: SeedService) {}

  @Post()
  run() {
    return this.service.run();
  }
}
