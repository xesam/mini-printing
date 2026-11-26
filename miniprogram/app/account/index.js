const FeieCloud = require('@xesam/cloud-vendor-feie');
const XpyunCloud = require('@xesam/cloud-vendor-xpyun');
const SpyunCloud = require('@xesam/cloud-vendor-spyun');
const CryptoJS = require('crypto-js');
const {request} = require('@mini-dev/request-wx');
const {events} = require('@mini-dev/event');
import CloudCore from '@xesam/cloud-core';
import accounts from '../../modules/account/index.js';

const signer = {
    SHA1(data) {
        return CryptoJS.SHA1(data).toString();
    },
    MD5(data) {
        return CryptoJS.MD5(data).toString().toUpperCase();
    }
};

const requestClient = {
    request(config) {
        const method = (config.method || 'post').toUpperCase();
        return request({
            url: config.url,
            method,
            data: ['GET', 'HEAD'].includes(method) ? config.params : config.data,
            header: config.headers,
            ext: {timeout: config.timeout || 10000}
        }).then(response => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                throw new Error(`HTTP ${response.statusCode}`);
            }
            return {
                statusCode: response.statusCode,
                data: response.data,
                header: response.header,
                cookies: response.cookies
            };
        });
    }
};

const cloudClient = new CloudCore.CloudClient(signer, requestClient);

const accountSession = {
    changeCurrentAccount(account) {
        accounts.setCurrentAccount(account);
        events.emit('account:changed', account);
    },
    getCurrentAccount() {
        return accounts.getCurrentAccount();
    },
    getCurrentAccountSync() {
        return accounts.getCurrentAccountSync();
    },
    getCurrentCloud() {
        const account = this.getCurrentAccountSync();
        if (!account) throw new Error('没有配置开放平台账号');
        // 每次都创建一个新的实例，不优雅但是在这个体量没什么大问题，干就完了。
        const auth = new CloudCore.CloudAuth(account.appid, account.secret);
        if (account.brand === accounts.FEIE.id) return new FeieCloud(auth, cloudClient);
        if (account.brand === accounts.XPYUN.id) return new XpyunCloud(auth, cloudClient);
        if (account.brand === accounts.SPYUN.id) return new SpyunCloud(auth, cloudClient);
        throw new Error(`不支持的平台厂商:${account.brand}`);
    }
};

export default accountSession;
