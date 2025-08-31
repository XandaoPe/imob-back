import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from './response.model';
import { Questionnaire } from 'src/questionnaire/questionnaire.model';
import { populate } from 'dotenv';

export interface PopulatedResponse extends Omit<Response, 'id_question'> {
  id_question: Questionnaire;
}
@Injectable()
export class ResponsesService {
  constructor(@InjectModel(Response.name) private responseModel: Model<Response>) {}

  async create(response: Response): Promise<Response> {
    const createdResponse = new this.responseModel(response);
    return createdResponse.save();
  }

  async findAll(): Promise<PopulatedResponse[]> {
    const responses = await this.responseModel.find().populate('id_question').exec();
    console.log('Dados de respostas com a pergunta populada:', responses);
    return responses as unknown as PopulatedResponse[];
  }
  
  async findOne(id: string): Promise<Response> {
    return this.responseModel.findById(id).exec();
  }

  async findByQuestionId(questionId: string): Promise<PopulatedResponse[]> {
    const responses = await this.responseModel.find({ id_question: questionId }).populate('id_question').exec();
    if (!responses || responses.length === 0) {
      throw new NotFoundException(`Respostas para a pergunta com ID "${questionId}" não encontradas.`);
    }
    return responses as unknown as PopulatedResponse[];
  }


  async update(id: string, response: Response): Promise<Response> {
    return this.responseModel.findByIdAndUpdate(id, response, { new: true }).exec();
  }

  async remove(id: string): Promise<Response> {
    return this.responseModel.findByIdAndDelete(id).exec();
  }
}
