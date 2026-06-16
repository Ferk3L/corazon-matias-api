import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { VerificationService } from './verification.service';
import { MailModule } from '../mail/mail.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule, MailModule],
  controllers: [AuthController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class AuthModule {}