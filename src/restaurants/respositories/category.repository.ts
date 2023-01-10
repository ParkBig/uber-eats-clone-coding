import { Repository } from "typeorm"
import { Category } from "../entities/category.entity"

export class CategoryRepository extends Repository<Category> {
  // 이곳 자체가 Category 레포지토리라고 생각하면됨.

  // Category 레포지토리에 getOrCreate기능을 만듬.
  public async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, "-");
    let category = await this.findOne({ where: { slug: categorySlug } });
    if (!category) {
      category = await this.save(this.create({ slug: categorySlug, name: categoryName }))
    };
    return category;
  }
}

// 끼야홋 커스텀레포 만듬ㅋ.
