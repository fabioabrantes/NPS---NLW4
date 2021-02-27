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

    const userAlreadyExists = await usersRepository.findOne({email});
    if(!userAlreadyExists){
      throw new AppError("does not user exists");
    }

    const surveyAlreadyExists = await surveysRepository.findOne({id:survey_id});
    if(!surveyAlreadyExists){
      throw new AppError("does not survey exists");
    }

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where:{user_id:userAlreadyExists, value:null}, // isso é um and. para ser um or usa assim where:[{user_id:userAlreadyExists}, {value:null}],
      relations:["user","survey"],
    });

    const npsPath = resolve(__dirname,"..", "views", "emails","npsMail.hbs");

    const variables = {
      name: userAlreadyExists.name,
      title:surveyAlreadyExists.title,
      description:surveyAlreadyExists.description,
      id:"",
      link:process.env.URL_MAIL
    };

    if(surveyUserAlreadyExists){
      variables.id = surveyUserAlreadyExists.id;
      await SendMailService.execute(email,surveyAlreadyExists.title, variables,npsPath);
      return response.json(surveyUserAlreadyExists);
    }

    const surveyUser = surveysUsersRepository.create({
      user_id:userAlreadyExists.id,
      survey_id
    })
    await surveysUsersRepository.save(surveyUser);

    //enviar email para o usuário
    variables.id = surveyUser.id;
    await SendMailService.execute(email,surveyAlreadyExists.title, variables,npsPath);

    return response.status(200).json(surveyUser);
  }
}

export {SendMailController}