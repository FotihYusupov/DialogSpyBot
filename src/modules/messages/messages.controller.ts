import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessMessage } from './schemas/message.schema';
import { User } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin', 'admin')
export class MessagesController {
  constructor(
    @InjectModel(BusinessMessage.name) private msgModel: Model<BusinessMessage>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  @Get('messages')
  async getMessages(
    @Query('type') type?: 'all' | 'deleted' | 'edited',
    @Query('search') search?: string,
    @Query('ownerId') ownerId?: string,
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 20
  ) {
    const filter: any = {};
    if (type === 'deleted') {
      filter.is_deleted = true;
    } else if (type === 'edited') {
      filter.is_edited = true;
    }
    if (ownerId && ownerId !== 'all') {
      filter.owner_id = Number(ownerId);
    }

    const cleanSearch = (search || '').trim();
    let isTextSearchUsed = false;

    if (cleanSearch) {
      // Smart search: Try $text search first for maximum speed using inverted index (<15ms)
      try {
        const textFilter = { ...filter, $text: { $search: cleanSearch } };
        const textCount = await this.msgModel.countDocuments(textFilter).exec();
        if (textCount > 0) {
          filter.$text = { $search: cleanSearch };
          isTextSearchUsed = true;
        }
      } catch (e) {
        // Fallback if query string has invalid syntax for $text parser
      }

      if (!isTextSearchUsed) {
        const escaped = cleanSearch.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        filter.$or = [
          { text: { $regex: escaped, $options: 'i' } },
          { sender_username: { $regex: escaped, $options: 'i' } },
          { sender_first_name: { $regex: escaped, $options: 'i' } },
          { chat_title: { $regex: escaped, $options: 'i' } }
        ];
      }
    }

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(100, parsedLimit);

    const skip = (pageNum - 1) * limitNum;

    // Fast count: estimatedDocumentCount if filter is completely empty
    const totalPromise = (Object.keys(filter).length === 0)
      ? this.msgModel.estimatedDocumentCount().exec()
      : this.msgModel.countDocuments(filter).exec();

    const pipeline: any[] = [
      { $match: filter },
      { $sort: isTextSearchUsed ? { score: { $meta: 'textScore' }, createdAt: -1, _id: -1 } : { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: limitNum },
      {
        $lookup: {
          from: 'users',
          localField: 'owner_id',
          foreignField: 'chat_id',
          as: 'owner'
        }
      },
      {
        $addFields: {
          owner: { $arrayElemAt: ['$owner', 0] }
        }
      }
    ];

    const [items, total] = await Promise.all([
      this.msgModel.aggregate(pipeline).exec(),
      totalPromise
    ]);

    return { items, total, page: pageNum, limit: limitNum };
  }

  @Get('media')
  async getMedia(
    @Query('category') category?: 'all' | 'photos' | 'voices' | 'videos' | 'stickers' | 'documents',
    @Query('ownerId') ownerId?: string,
    @Query('status') status?: 'all' | 'deleted' | 'edited',
    @Query('search') search?: string,
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 20
  ) {
    const filter: any = {
      media_type: { $exists: true, $ne: null }
    };

    if (category && category !== 'all') {
      if (category === 'photos') {
        filter.media_type = { $regex: 'rasm|photo|image', $options: 'i' };
      } else if (category === 'voices') {
        filter.media_type = { $regex: 'voice|ovoz|audio', $options: 'i' };
      } else if (category === 'videos') {
        filter.media_type = { $regex: 'video|gif|animation|round', $options: 'i' };
      } else if (category === 'stickers') {
        filter.media_type = { $regex: 'sticker', $options: 'i' };
      } else if (category === 'documents') {
        filter.media_type = { $regex: 'document|fayl|file', $options: 'i' };
      }
    }

    if (status === 'deleted') {
      filter.is_deleted = true;
    } else if (status === 'edited') {
      filter.is_edited = true;
    }

    if (ownerId && ownerId !== 'all') {
      filter.owner_id = Number(ownerId);
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const escaped = cleanSearch.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      filter.text = { $regex: escaped, $options: 'i' };
    }

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 24 : Math.min(100, parsedLimit);

    const skip = (pageNum - 1) * limitNum;
    const [items, total] = await Promise.all([
      this.msgModel.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: 'users',
            localField: 'owner_id',
            foreignField: 'chat_id',
            as: 'owner'
          }
        },
        {
          $addFields: {
            owner: { $arrayElemAt: ['$owner', 0] }
          }
        }
      ]).exec(),
      this.msgModel.countDocuments(filter).exec()
    ]);

    return { items, total, page: pageNum, limit: limitNum };
  }

  @Get('connections')
  async getConnections() {
    const usersWithConn = await this.userModel.find({
      business_connection_id: { $exists: true, $ne: null }
    }).exec();

    const connections = await Promise.all(
      usersWithConn.map(async (usr) => {
        const count = await this.msgModel.countDocuments({
          business_connection_id: usr.business_connection_id
        }).exec();

        return {
          id: usr.business_connection_id,
          owner: `${usr.first_name || 'User'} (@${usr.username || 'no_username'})`,
          status: 'active',
          health: 'healthy',
          lastSync: usr.updatedAt || usr.createdAt,
          messagesLogged: count
        };
      })
    );

    return connections;
  }
}
