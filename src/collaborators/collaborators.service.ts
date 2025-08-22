import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collaborator } from './collaborators.model';

@Injectable()
export class CollaboratorsService {
  constructor(@InjectModel(Collaborator.name) private collaboratorModel: Model<Collaborator>) {}

  async create(collaborator: Collaborator): Promise<Collaborator> {
    const createdCollaborator = new this.collaboratorModel(collaborator);
    return createdCollaborator.save();
  }

  async findAll(): Promise<Collaborator[]> {
    return this.collaboratorModel.find().exec();
  }

  async findOne(id: string): Promise<Collaborator> {
    return this.collaboratorModel.findById(id).exec();
  }

  async findImage(id: string): Promise<Collaborator> {
    return this.collaboratorModel.findById(id).exec();
  }

  async update(id: string, collaborator: Collaborator): Promise<Collaborator> {
    return this.collaboratorModel.findByIdAndUpdate(id, collaborator, { new: true }).exec();
  }

  async remove(id: string): Promise<Collaborator> {
    return this.collaboratorModel.findByIdAndDelete(id).exec();
  }
}
