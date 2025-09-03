import { Injectable, NotFoundException } from '@nestjs/common';
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
      const responses = await this.questionnaireModel.find({ isDeleted: { $ne: true } }).exec();
      console.log('Dados de questões : ', responses);
      return responses;
    }

      async findOne(id: string): Promise<Questionnaire> {
        const response = await this.questionnaireModel.findOne({ _id: id, isDeleted: { $ne: true } }).exec();
        if (!response) {
          throw new NotFoundException(`Questão com ID "${id}" não encontrada ou já foi removida.`);
        }
        return response;
      }

      
      async update(id: string, questionnaire: Questionnaire): Promise<Questionnaire> {
        return this.questionnaireModel.findByIdAndUpdate(id, questionnaire, { new: true }).exec();
      }
      
      async remove(id: string): Promise<Questionnaire> {
        const updatedResponse = await this.questionnaireModel.findByIdAndUpdate(
          id,
          { isDeleted: true }, // ✅ O payload de atualização
          { new: true }
        ).exec();
        
        if (!updatedResponse) {
          throw new NotFoundException(`Questão com ID "${id}" não encontrada.`);
        }
        
        return updatedResponse;
      }


      // async findAll(): Promise<Questionnaire[]> {
      //   return this.questionnaireModel.find().exec();
      // }
    
      // async findOne(id: string): Promise<Questionnaire> {
      //   return this.questionnaireModel.findById(id).exec();
      // }
      
      // async remove(id: string): Promise<Questionnaire> {
  //   return this.questionnaireModel.findByIdAndDelete(id).exec();
  // }
}
