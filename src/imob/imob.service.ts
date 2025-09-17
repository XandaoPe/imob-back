import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Imob } from './imob.model';

@Injectable()
export class ImobsService {
  constructor(@InjectModel(Imob.name) private imobModel: Model<Imob>) { }

  async create(imob: Imob): Promise<Imob> {
    const createdImob = new this.imobModel(imob);
    return createdImob.save();
  }

  async findAll(): Promise<Imob[]> {
    return this.imobModel.find().exec();
  }

  async findOne(id: string): Promise<{ data: Imob | null; message: string; status: number }> {
    try {
      
      const data = await this.imobModel.findById(id).exec();

      if (!data) {
        return {
          data: null,
          message: 'Imóvel não encontrado',
          status: 404
        };
      }

      return {
        data,
        message: 'Imóvel encontrado com sucesso',
        status: 200
      };

    } catch (error) {
      return {
        data: null,
        message: 'Erro ao buscar imóvel',
        status: 500
      };
    }
  }

  async update(id: string, imob: Imob): Promise<Imob> {
    return this.imobModel.findByIdAndUpdate(id, imob, { new: true }).exec();
  }

  async remove(id: string): Promise<Imob> {
    return this.imobModel.findByIdAndDelete(id).exec();
  }
}
