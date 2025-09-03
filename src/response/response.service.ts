import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from './response.model';
import { Questionnaire } from 'src/questionnaire/questionnaire.model';

export interface PopulatedResponse extends Omit<Response, 'id_question'> {
  id_question: Questionnaire;
}

@Injectable()
export class ResponsesService {
  constructor(@InjectModel(Response.name) private responseModel: Model<Response>) { }

  async create(response: Response): Promise<Response> {
    const createdResponse = new this.responseModel(response);
    return createdResponse.save();
  }

  async findAll(): Promise<PopulatedResponse[]> {
    const responses = await this.responseModel.find({ isDeleted: { $ne: true } }).populate('id_question').exec();
    console.log('Dados de respostas com a pergunta populada:', responses);
    return responses as unknown as PopulatedResponse[];
  }

  async findOne(id: string): Promise<Response> {
    const response = await this.responseModel.findOne({ _id: id, isDeleted: { $ne: true } }).exec();
    if (!response) {
      throw new NotFoundException(`Resposta com ID "${id}" não encontrada ou já foi removida.`);
    }
    return response;
  }

  async findByQuestionId(questionId: string): Promise<PopulatedResponse[]> {
    const responses = await this.responseModel.find({ id_question: questionId, isDeleted: { $ne: true } }).populate('id_question').exec();
    if (!responses || responses.length === 0) {
      throw new NotFoundException(`Respostas para a pergunta com ID "${questionId}" não foram encontradas.`);
    }
    return responses as unknown as PopulatedResponse[];
  }

  async update(id: string, response: Response): Promise<Response> {
    return this.responseModel.findByIdAndUpdate(id, response, { new: true }).exec();
  }

  async remove(id: string): Promise<Response> {
    const updatedResponse = await this.responseModel.findByIdAndUpdate(
      id,
      { isDeleted: true }, // ✅ O payload de atualização
      { new: true }
    ).exec();

    if (!updatedResponse) {
      throw new NotFoundException(`Resposta com ID "${id}" não encontrada.`);
    }

    return updatedResponse;
  }
}
