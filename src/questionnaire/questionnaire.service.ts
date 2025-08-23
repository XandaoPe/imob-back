import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Questionnaire } from './questionnaire.model';

@Injectable()
export class QuestionnairesService {
  constructor(@InjectModel(Questionnaire.name) private questionnaireModel: Model<Questionnaire>) {}

  async create(questionnaire: Questionnaire): Promise<Questionnaire> {
    const createdQuestionnaire = new this.questionnaireModel(questionnaire);
    return createdQuestionnaire.save();
  }

  async findAll(): Promise<Questionnaire[]> {
    return this.questionnaireModel.find().exec();
  }

  async findOne(id: string): Promise<Questionnaire> {
    return this.questionnaireModel.findById(id).exec();
  }

  async update(id: string, questionnaire: Questionnaire): Promise<Questionnaire> {
    return this.questionnaireModel.findByIdAndUpdate(id, questionnaire, { new: true }).exec();
  }

  async remove(id: string): Promise<Questionnaire> {
    return this.questionnaireModel.findByIdAndDelete(id).exec();
  }
}
