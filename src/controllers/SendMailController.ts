import { resolve } from 'path';
import { Request,Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../Repositories/SurveysRepository";
import { SurveysUsersRepository } from "../Repositories/SurveysUsersRepository";
import { UsersRepository } from "../Repositories/UsersRepository";
import SendMailService from "../services/SendMailService";
import { AppError } from '../errors/AppError';

class SendMailController{

  async execute(request:Request,response:Response){
    const {email, survey_id} = request.body;
    
    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    // verificar de usuario não existe, envia error
    const userAlreadyExists = await usersRepository.findOne({email});
    if(!userAlreadyExists){
      throw new AppError("does not user exists");
      // return response.status(400).json({error:"does not user exists"})
    }

    // verificar se survey não existe, envia error
    const surveyAlreadyExists = await surveysRepository.findOne({id:survey_id});
    if(!surveyAlreadyExists){
      throw new AppError("does not survey exists");
    }

    const npsPath = resolve(__dirname,"..", "views", "emails","npsMail.hbs");

    const variables = {
      name: userAlreadyExists.name,
      title:surveyAlreadyExists.title,
      description:surveyAlreadyExists.description,
      id:"", // vai receber o id de surveyUserAlreadyExists
      link:process.env.URL_MAIL
    };

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where:{user_id:userAlreadyExists.id, value:null}, //vai ser necessário duas condições, precisa do where. isso é um and. para ser um or usa assim where:[{user_id:userAlreadyExists}, {value:null}],
      relations:["user","survey"],
    });


    // verifica se existe um survey_user no BD, se sim envia email e altera id 
    if(surveyUserAlreadyExists){
      variables.id = surveyUserAlreadyExists.id; // atualiza
      await SendMailService.execute(email,surveyAlreadyExists.title, variables,npsPath);
      return response.json(surveyUserAlreadyExists);
    }

    // criando e salvando na tabela
    const surveyUser = surveysUsersRepository.create({
      user_id:userAlreadyExists.id,
      survey_id
    })
    await surveysUsersRepository.save(surveyUser);

    variables.id = surveyUser.id;

    //enviar email para o usuário usando o serviço
    await SendMailService.execute(email,surveyAlreadyExists.title, variables,npsPath);

    return response.status(200).json(surveyUser);
  }
}

export {SendMailController}