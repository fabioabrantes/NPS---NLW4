import { Request,Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysUsersRepository } from "../Repositories/SurveysUsersRepository";

class AnswerController{
  // http://localhost:3333/answers/3?su=92bc3567-2d5d-461b-9e49-520e1a74ef12
  /* 
    Route param => parametros que compôe a rota 
      ex: /answers/3
      routes.get('/answers/:value', controller.ddddd)
    Query params => Busca, paginação, parâmetros não obrigatórios
      ex: ?su=92bc3567-2d5d-461b-9e49-520e1a74ef12
  */
  async execute(request:Request, response:Response){
      const {value} = request.params;//Route param
      const {su} = request.query; //Query params

      const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
      
      const surveyUser = await surveysUsersRepository.findOne({
        id: String(su)
      });
      if(!surveyUser){
        throw new AppError("Survey User does not exists!");
       
      }
      surveyUser.value = Number(value);
      await surveysUsersRepository.save(surveyUser);

      return response.status(200).json(surveyUser);
  }
}

export {AnswerController}