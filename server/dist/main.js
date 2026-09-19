import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
async function bootstrap() {
    const hasValidObserveKeys = Boolean(process.env.OBSERVE_APP_KEY &&
        process.env.OBSERVE_APP_KEY !== 'YOUR_APP_KEY' &&
        process.env.OBSERVE_APP_SECRET &&
        process.env.OBSERVE_APP_SECRET !== 'YOUR_APP_SECRET');
    const app = await NestFactory.create(AppModule, hasValidObserveKeys ? { instrument: ObserveInstrument } : {});
    const configService = app.get(ConfigService);
    const port = configService.get('port') || 8000;
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new ResponseInterceptor(reflector));
    app.useGlobalFilters(new HttpExceptionFilter());
    const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        configService.get('frontendUrl') || 'http://localhost:3000',
    ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    });
    const swaggerConfig = new DocumentBuilder()
        .setTitle('CodePlatform API')
        .setDescription('RESTful API documentation for CodePlatform online learning and competitive programming backend')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT access token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    await app.listen(port);
    console.log(`Application running on http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
await bootstrap();
//# sourceMappingURL=main.js.map