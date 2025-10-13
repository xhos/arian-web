import { create } from "@bufbuild/protobuf";
import { categoryClient } from "@/lib/grpc-client";
import {
  ListCategoriesRequestSchema,
  CreateCategoryRequestSchema,
  UpdateCategoryRequestSchema,
  DeleteCategoryRequestSchema,
} from "@/gen/arian/v1/category_services_pb";

export interface CreateCategoryInput {
  slug: string;
  color: string;
}

export interface UpdateCategoryInput {
  id: bigint;
  slug: string;
  color: string;
}

export interface UpdateCategoryColorInput {
  id: bigint;
  slug: string;
  color: string;
}

export const categoriesApi = {
  async list(userId: string) {
    const request = create(ListCategoriesRequestSchema, { userId });
    const response = await categoryClient.listCategories(request);
    return response.categories;
  },

  async create(data: CreateCategoryInput) {
    const request = create(CreateCategoryRequestSchema, {
      slug: data.slug,
      color: data.color,
    });
    const response = await categoryClient.createCategory(request);
    return response.category;
  },

  async update(data: UpdateCategoryInput) {
    const request = create(UpdateCategoryRequestSchema, {
      id: data.id,
      slug: data.slug,
      color: data.color,
      updateMask: { paths: ["slug", "color"] },
    });
    const response = await categoryClient.updateCategory(request);
    return response.category;
  },

  async updateColor(data: UpdateCategoryColorInput) {
    const request = create(UpdateCategoryRequestSchema, {
      id: data.id,
      slug: data.slug,
      color: data.color,
      updateMask: { paths: ["color"] },
    });
    const response = await categoryClient.updateCategory(request);
    return response.category;
  },

  async delete(id: bigint) {
    const request = create(DeleteCategoryRequestSchema, { id });
    await categoryClient.deleteCategory(request);
  },
};
