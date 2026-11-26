const { Router } = require('@mini-dev/router');
import accountRouter from "../../pages/account/router.js";
import deviceRouter from "../../pages/device/router.js";
import mainRouter from "../../pages/router.js";

export default new Router()
    .use('main', mainRouter.basePath('/pages'))
    .use('device', deviceRouter.basePath('/pages/device'))
    .use('account', accountRouter.basePath('/pages/account'));
