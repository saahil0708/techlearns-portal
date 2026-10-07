import { Global, Module } from '@nestjs/common';
import { AIProviderService } from './ai-provider.service.js';

@Global()
@Module({
  providers: [AIProviderService],
  exports: [AIProviderService],
})
export class AIModule {}
