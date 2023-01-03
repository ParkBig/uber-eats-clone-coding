import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interface'
import got from "got";
import * as FormData from 'form-data';

@Injectable() // 이걸 해야 아래 constructor사용해서 다른거 가져오기쌉가능.
export class MailService {
  constructor(
    // app.module의 config를 가져오는 두가지 방법
    // 첫 번째 꺼는 mail모듈에서 써준 내용이 있어야 가능
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
    private readonly config: ConfigService
    ) {
      
    }

  async sendEmail(subject: string, template: string, emailVars: EmailVar[]): Promise<boolean> {
    const form = new FormData();
    form.append("from", `Uber Clone Eats <mailgun@${this.options.domain}>`);
    form.append("to", `enfantgu@gmail.com`);
    form.append("subject", subject);
    form.append("template", template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got.post(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`,).toString('base64')}`,
        },
        body: form,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail("Verify Your Email", "verify-email", [{key:"code", value: code}, {key:"username", value: email}])
  }
}
