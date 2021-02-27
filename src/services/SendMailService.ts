import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';

class SendMailService{
  private client:Transporter;
  constructor(){
    nodemailer.createTestAccount().then(account =>{

      const transporter = nodemailer.createTransport({
        host:'smtp.ethereal.email',
        port:587,
        auth:{
          user:'dominique.blanda@ethereal.email',
          pass:'n7AWPx9CEgRxk75vTb',
        },
        tls: {
          rejectUnauthorized: false,
        }
      });
      this.client = transporter;
    });
  }
  async execute(to:string,subject:string, variables:object,path:string){
    const templateFileContent = fs.readFileSync(path).toString('utf8');

    const mailTemplateParse = handlebars.compile(templateFileContent); //aqui vai fazer a gente passar nossas variaveis do npsMail.hbs para dentro da aplicação
   
    const html = mailTemplateParse(variables); //aqui passamos as variáveis como argumento

    const message = await this.client.sendMail({
      to,
      subject,
      html,
      from:"NPS <noreplay@nps.com.br>",
    });
    console.log('Message sent: %s', message.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message));
  }
}

export default new SendMailService();