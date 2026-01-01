import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerController } from './customer/customer.controller';
import { CustomerModule } from './customer/customer.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudService } from './services/cloud-service/cloud-service.service';

@Module({
  
  controllers: [AppController, CustomerController],
  providers: [AppService , CloudService],
    imports: [ 
    CustomerModule, 
      
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: 5432,
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ]
})
export class AppModule {}
