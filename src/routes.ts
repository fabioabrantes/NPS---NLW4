import {Router} from 'express';
import { UserController } from './controllers/UserController';
import { SurveysController } from './controllers/SurveysController';
import { SendMailController } from './controllers/SendMailController';
import { AnswerController } from './controllers/AnswerController';
import { NPSController } from './controllers/NPSCrontroller';


const router = Router();

const userController = new UserController();
const surveyController = new SurveysController();
const sendMailController = new SendMailController();
const answerController = new AnswerController();
const npsController = new NPSController();

// ========== USERS ===========
router.post('/users', userController.create);

//============= SURVEY ==================
router.post('/surveys', surveyController.create);
router.get('/surveys', surveyController.show);

// ========== Survey_User ============
router.post('/sendMail', sendMailController.execute);
router.get('/answers/:value', answerController.execute);

router.get('/nps/:survey_id', npsController.execute);

export {router}

