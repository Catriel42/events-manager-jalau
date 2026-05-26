import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    const slug = createTagDto.slug || this.generateSlug(createTagDto.name);
    
    const existing = await this.prisma.tag.findFirst({
      where: { OR: [{ name: createTagDto.name }, { slug }] }
    });

    if (existing) {
      throw new ConflictException('Tag with this name or slug already exists');
    }

    return this.prisma.tag.create({
      data: {
        name: createTagDto.name,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    await this.findOne(id); // Ensure exists

    let slug = updateTagDto.slug;
    if (updateTagDto.name && !slug) {
      slug = this.generateSlug(updateTagDto.name);
    }

    if (updateTagDto.name || slug) {
      const existing = await this.prisma.tag.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(updateTagDto.name ? [{ name: updateTagDto.name }] : []),
            ...(slug ? [{ slug }] : []),
          ],
        },
      });

      if (existing) {
        throw new ConflictException('Tag with this name or slug already exists');
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        ...(updateTagDto.name && { name: updateTagDto.name }),
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists
    return this.prisma.tag.delete({ where: { id } });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
