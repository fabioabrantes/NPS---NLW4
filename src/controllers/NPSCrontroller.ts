import { Request, Response } from "express";
import { getCustomRepository,Not, IsNull } from "typeorm";
import { SurveysUsersRepository } from "../Repositories/SurveysUsersRepository";

/* 
12345678910
Detratores => 0 - 6
Passivos => 7-8
Promotores => 9 - 10 

Cálculo
(Números de promotores - números de detratores)/ (número de respondentes) *100
*/
class NPSController{

  async execute(request: Request, response: Response){
    const {survey_id} = request.params;

    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveysUsers = await surveysUsersRepository.find({
      survey_id,
      value: Not(IsNull()),
    });
    
    //filtrando os detratores, promotores e passivos
    const detractors = surveysUsers.filter(
      (surveyUser) => surveyUser.value>=0 && surveyUser.value <=6).length;
    
    const promoters = surveysUsers.filter(
      (surveyUser) => surveyUser.value>=9 && surveyUser.value <=10).length;

    const passives = surveysUsers.filter(
      (surveyUser) => surveyUser.value>=7 && surveyUser.value <=8).length;
    
    const totalAnswers = surveysUsers.length;

    let calculate = ((promoters - detractors)/totalAnswers)*100;
    calculate = Number(calculate.toFixed(2));
    
    return response.json({
      detractors,
      promoters,
      passives,
      totalAnswers,
      nps:calculate
    });
    
  }
}
export {NPSController}