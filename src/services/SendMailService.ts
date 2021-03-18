import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';

import SMTP_CONFIG from '../config/mail'

class SendMailService{
  private client:Transporter;
  constructor(){// construtor não permite async
        const transporter = nodemailer.createTransport({
        host:SMTP_CONFIG.host,//account.smtp.host,//'smtp.ethereal.email',
        port:SMTP_CONFIG.port,//account.smtp.port,//587,
        auth:{
          user:SMTP_CONFIG.user,//account.user,//'dominique.blanda@ethereal.email',
          pass:SMTP_CONFIG.pass,//account.pass,//'n7AWPx9CEgRxk75vTb',
        },
        tls: {
          rejectUnauthorized: false,
        }
      });
      this.client = transporter;
  }
  async execute(to:string,subject:string, variables:object,path:string){
    const templateFileContent = fs.readFileSync(path).toString('utf8'); // aqui lero arquivo e devolve na variável

    const mailTemplateParse = handlebars.compile(templateFileContent); //aqui pegamos o template para compila-lo. para a gente passar nossas variaveis do npsMail.hbs para dentro da do handlebar
   
    const html = mailTemplateParse(variables); //aqui passamos as variáveis como argumento

    const message = await this.client.sendMail({
      to,
      subject,
      html,
      from:"NPS <noreplay@nps.com.br>",
    });
    /* 
    se eu quiser anexar arquivos
    attachments: [{ // Basta incluir esta chave e listar os anexos
    filename: 'boleto.pdf', // O nome que aparecerá nos anexos
    path: 'servidor/boletos/boleto_gerado1234.pdf' // O arquivo será lido neste local ao ser enviado
  }]
    */
    console.log('Message sent: %s', message.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message));
  }
}

export default new SendMailService();