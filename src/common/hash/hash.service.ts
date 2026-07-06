import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly saltRounds: number;

  constructor() {
    const rounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
    this.saltRounds = isNaN(rounds) || rounds < 1 ? 10 : rounds;
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare({
    string,
    hashedString,
  }: {
    string: string;
    hashedString: string;
  }): Promise<boolean> {
    return bcrypt.compare(string, hashedString);
  }
}
