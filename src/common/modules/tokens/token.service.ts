import { Injectable } from '@nestjs/common';
import { Token, TokenDocument } from '../../schemas/token.schema';
import { Model } from 'mongoose';
import { BaseService } from '../../services/base.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TokenService extends BaseService<Token> {
  constructor(
    @InjectModel(Token.name) private tokenDocument: Model<TokenDocument>,
  ) {
    super(tokenDocument);
  }
  async getToken(name: string): Promise<Token> {
    return (await this.tokenDocument.findOne({ name }))!;
  }
}
