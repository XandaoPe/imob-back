import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from './response.model';

@Injectable()
export class ResponsesService {
  constructor(@InjectModel(Response.name) private responseModel: Model<Response>) {}

  async create(response: Response): Promise<Response> {
    const createdResponse = new this.responseModel(response);
    return createdResponse.save();
  }

  async findAll(): Promise<Response[]> {
    return this.responseModel.find().exec();
  }

  async findOne(id: string): Promise<Response> {
    return this.responseModel.findById(id).exec();
  }

  async update(id: string, response: Response): Promise<Response> {
    return this.responseModel.findByIdAndUpdate(id, response, { new: true }).exec();
  }

  async remove(id: string): Promise<Response> {
    return this.responseModel.findByIdAndDelete(id).exec();
  }
}
