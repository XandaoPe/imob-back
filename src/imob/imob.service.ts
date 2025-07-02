import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Imob } from './imob.model';

@Injectable()
export class ImobsService {
  constructor(@InjectModel(Imob.name) private imobModel: Model<Imob>) {}

  async create(imob: Imob): Promise<Imob> {
    console.log('payload service...', imob)
    const createdImob = new this.imobModel(imob);
    console.log('createdImob service...', createdImob)
    return createdImob.save();
  }

  async findAll(): Promise<Imob[]> {
    return this.imobModel.find().exec();
  }

  async findOne(id: string): Promise<Imob> {
    return this.imobModel.findById(id).exec();
  }

  async findImage(id: string): Promise<Imob> {
    return this.imobModel.findById(id).exec();
  }

  async update(id: string, imob: Imob): Promise<Imob> {
    return this.imobModel.findByIdAndUpdate(id, imob, { new: true }).exec();
  }

  async remove(id: string): Promise<Imob> {
    return this.imobModel.findByIdAndDelete(id).exec();
  }
}
