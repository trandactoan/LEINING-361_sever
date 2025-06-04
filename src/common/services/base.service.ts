/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export class BaseService<T> {
  constructor(protected readonly model: any) {} // Accepts a Mongoose model or ORM repository

  async findAll(): Promise<T[]> {
    return this.model.find();
  }

  async findOne(id: string): Promise<T> {
    return this.model.findById(id);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<T> {
    return this.model.findByIdAndDelete(id);
  }
}
