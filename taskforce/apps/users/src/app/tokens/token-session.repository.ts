import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CRUDRepository } from '@taskforce/shared-types';
import { TokenSession } from '@taskforce/shared-types';
import { Model } from 'mongoose';
import { TokenSessionModel } from './token-session.model';
import { TokenSessionEntity } from './token-session.entity';

@Injectable()
export default class TokenSessionRepository implements CRUDRepository<TokenSessionEntity, string, TokenSession> {

  constructor(
    @InjectModel(TokenSessionModel.name) private readonly tokenSessionModel: Model<TokenSessionModel>
  ){}

  public async create(item: TokenSessionEntity): Promise<TokenSession> {
      return this.tokenSessionModel.create(item);
  }

  public async findById(_id: string): Promise<TokenSession | null> {
    return this.tokenSessionModel
      .findOne({_id})
      .exec();
  }

  public async findByUserId(userId: string): Promise<TokenSession | null> {
    return this.tokenSessionModel
      .findOne({userId: userId})
      .exec();
  }

  public async update(_id: string, item: TokenSessionEntity): Promise<TokenSession> {
    return this.tokenSessionModel
      .findByIdAndUpdate(_id, item.toObject(), {new: true})
      .exec();
  }

  public async destroy(userId: string): Promise<void> {
    await this.tokenSessionModel.deleteMany({userId: userId});
  }
}
