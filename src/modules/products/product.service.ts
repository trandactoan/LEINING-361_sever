import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { ProductResponseDto } from './dto/product_response.dto';
import { UpdateProductDto } from './dto/update_product.dto';
import { CreateProductDto } from './dto/create_product.dto';
import { ProductDetail, ProductDetailDocument } from './product_detail.schema';
import { ProductDetailDto } from './dto/product_detail.dto';
import { ImageService } from 'src/common/modules/images/image.service';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductDetail.name) private productDetailModel: Model<ProductDetailDocument>,
    private imageService: ImageService,
  ) {
    super(productModel);
  }

  async getProductListByCategory(
    categoryId: string,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productModel
      .find({
        categoryId: categoryId,
      })
      .exec();
    
    const productResponses = await Promise.all(
      products.map(async (product) => {
        const variants = await this.getProductVariants(product._id.toString());
        return new ProductResponseDto(product, variants);
      })
    );
    
    return productResponses;
  }

  async getProductById(productId: string): Promise<ProductResponseDto> {
    const productObjectId = new Types.ObjectId(productId);
    const product = await this.productModel.findById(productObjectId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    const variants = await this.getProductVariants(productId);
    return new ProductResponseDto(product, variants);
  }

  async getAll(): Promise<ProductResponseDto[]> {
    const products = await this.productModel.find().exec();
    
    const productResponses = await Promise.all(
      products.map(async (product) => {
        const variants = await this.getProductVariants(product._id.toString());
        return new ProductResponseDto(product, variants);
      })
    );
    
    return productResponses;
  }

  async getProductVariants(productId: string): Promise<ProductDetailDto[]> {
    const productObjectId = new Types.ObjectId(productId);
    const details = await this.productDetailModel
      .find({ productId: productObjectId })
      .exec();
    return details.map((detail) => new ProductDetailDto(detail));
  }

  private async ensureImagesArray(images?: string[]): Promise<(string | undefined)[]> {
    if (!images || !Array.isArray(images)) return [];
    const result: (string | undefined)[] = [];
    for (const img of images) {
      if (!img) continue;
      try {
        const normalized = await this.imageService.normalizeImageReference(img);
        result.push(normalized);
      } catch (err) {
        // if normalization fails, push original value to avoid blocking whole request
        result.push(img);
      }
    }
    return result;
  }

  async updateProduct(
    id: string,
    updateDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const objectId = new Types.ObjectId(id);
    const product = await this.productModel.findById(objectId).exec();
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Separate product fields and variants
    const { variants: variantsDto, ...productFields } = updateDto as any;

    // Normalize images on top-level product fields if present
    if (productFields.images && Array.isArray(productFields.images)) {
      const normalized = await this.ensureImagesArray(productFields.images as string[]);
      // filter out undefined and keep strings
      productFields.images = normalized.filter((x) => !!x) as string[];
    }

    // Normalize sizeGuide if present
    if (productFields.sizeGuide && typeof productFields.sizeGuide === 'string' && productFields.sizeGuide.trim()) {
      try {
        productFields.sizeGuide = await this.imageService.normalizeImageReference(productFields.sizeGuide);
      } catch (err) {
        // leave original value if normalization fails
      }
    }

    // For variants provided in update, normalize variationImage fields before persisting
    if (Array.isArray(variantsDto)) {
      for (const v of variantsDto) {
        // Only process variationImage if it's a non-empty string
        if (v && v.variationImage && typeof v.variationImage === 'string' && v.variationImage.trim()) {
          try {
            v.variationImage = await this.imageService.normalizeImageReference(v.variationImage);
          } catch (err) {
            // leave original value if normalization fails
          }
        } else if (v) {
          // Clear variationImage if it's not a valid string
          v.variationImage = undefined;
        }
      }
    }

    // Update top-level product fields
    const result = await this.productModel.findByIdAndUpdate(
      objectId,
      { $set: productFields },
      { new: true, runValidators: true },
    ).exec();

    // Process variants if provided
    if (Array.isArray(variantsDto)) {
      // Get existing variant ids
      const existingDetails = await this.productDetailModel.find({ productId: objectId }).exec();
      const existingIds = existingDetails.map((d) => d._id?.toString());

      const processedIds: string[] = [];

      for (const v of variantsDto) {
        if (v.id) {
          // update existing variant
          const vid = v.id;
          await this.productDetailModel.findByIdAndUpdate(
            vid,
            {
              $set: {
                attributes: v.attributes,
                price: v.price,
                originalPrice: v.originalPrice,
                stock: v.stock,
                sku: v.sku,
                variationImage: v.variationImage,
                soldCount: v.soldCount || 0
              },
            },
            { new: true, runValidators: true },
          ).exec();
          processedIds.push(vid);
        } else {
          // create new variant
          const created = await this.productDetailModel.create({
            productId: objectId,
            attributes: v.attributes,
            price: v.price,
            originalPrice: v.originalPrice,
            stock: v.stock,
            sku: v.sku,
            variationImage: v.variationImage,
            soldCount: v.soldCount || 0,
            createdAt: new Date(),
          });
          if (created._id) processedIds.push(created._id.toString());
        }
      }

      // Delete variants that were removed in the update payload
      const toDelete = existingIds.filter((idStr) => !processedIds.includes(idStr));
      if (toDelete.length > 0) {
        await this.productDetailModel.deleteMany({ _id: { $in: toDelete } }).exec();
      }
    }

    const variants = await this.getProductVariants(id);
    return new ProductResponseDto(result!, variants);
  }

  async createProduct(
    createDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    

    // Normalize images before creating product
    const normalizedImages = await this.ensureImagesArray(createDto.images as string[]);

    // Normalize sizeGuide if present
    let normalizedSizeGuide: string | undefined = undefined;
    if (createDto.sizeGuide && typeof createDto.sizeGuide === 'string' && createDto.sizeGuide.trim()) {
      try {
        normalizedSizeGuide = await this.imageService.normalizeImageReference(createDto.sizeGuide);
      } catch (err) {
        normalizedSizeGuide = createDto.sizeGuide;
      }
    }

    // Separate variants from product data
    const { variants: variantsInput, ...productDataOnly } = createDto as any;


    const productData = {
      ...productDataOnly,
      images: normalizedImages.filter((x) => !!x),
      sizeGuide: normalizedSizeGuide,
      hasVariants: createDto.hasVariants || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.productModel.create(productData);

    // Create product details (variants) if provided
    let variants: ProductDetailDto[] = [];
    
    if (variantsInput && Array.isArray(variantsInput) && variantsInput.length > 0) {
      const detailsToCreate = [] as any[];
      for (const variant of variantsInput) {
        let variationImage: string | undefined = undefined;
        // Only process variationImage if it's a non-empty string
        if (variant.variationImage && typeof variant.variationImage === 'string' && variant.variationImage.trim()) {
          try {
            variationImage = await this.imageService.normalizeImageReference(variant.variationImage);
          } catch (err) {
            variationImage = variant.variationImage;
          }
        }

        const detailRecord = {
          productId: result._id,
          attributes: variant.attributes,
          price: variant.price,
          originalPrice: variant.originalPrice,
          stock: variant.stock,
          sku: variant.sku,
          variationImage,
          soldCount: variant.soldCount || 0,
          createdAt: new Date(),
        };
        
        detailsToCreate.push(detailRecord);
      }

      if (detailsToCreate.length > 0) {
        const createdDetails = await this.productDetailModel.insertMany(detailsToCreate);
        variants = createdDetails.map((detail) => new ProductDetailDto(detail as any));
      }
    } else {
      
    }

    return new ProductResponseDto(result, variants);
  }
}
