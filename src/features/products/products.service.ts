import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) {}

  async findAll() {
    const products = await this.productModel.find().sort({ createdAt: -1 });
    return products.map((product) => this.toResponse(product));
  }

  async findOne(id: string) {
    const product = await this.findProductById(id);
    return this.toResponse(product);
  }

  async create(createProductDto: CreateProductDto) {
    const product = await this.productModel.create(createProductDto);
    return this.toResponse(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    this.validateObjectId(id);

    const product = await this.productModel.findByIdAndUpdate(id, updateProductDto, {
      new: true,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  async remove(id: string) {
    this.validateObjectId(id);

    const product = await this.productModel.findByIdAndDelete(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  private async findProductById(id: string) {
    this.validateObjectId(id);

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private validateObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product id');
    }
  }

  private toResponse(product: ProductDocument) {
    return {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
