"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePremium = exports.IS_PREMIUM_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PREMIUM_KEY = 'isPremiumRequired';
const RequirePremium = () => (0, common_1.SetMetadata)(exports.IS_PREMIUM_KEY, true);
exports.RequirePremium = RequirePremium;
//# sourceMappingURL=require-premium.decorator.js.map