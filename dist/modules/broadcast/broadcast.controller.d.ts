import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
export declare class BroadcastController {
    private broadcastService;
    constructor(broadcastService: BroadcastService);
    createAndSend(dto: CreateBroadcastDto): Promise<{
        message: string;
        broadcastId: import("mongoose").Types.ObjectId;
        status: string;
    }>;
    getBroadcasts(): Promise<import("./schemas/broadcast.schema").Broadcast[]>;
    getStatus(id: string): Promise<import("./schemas/broadcast.schema").Broadcast>;
}
