import {getBrandById} from "./cloud-brand.js";
const {createStorage} = require('@mini-dev/storage-wx');

// 创建账号列表存储实例
const accountListStore = createStorage({
    namespace: 'app.accounts'
});

// 创建当前账号存储实例
const currentAccountStore = createStorage({
    namespace: 'app.account'
});

function createIdForAccount(account) {
    return account.brand + "_" + Date.now();
}

function addBrandName(account) {
    if (!account) {
        return;
    }
    account.brandName = getBrandById(account.brand).name;
}

function _findByIdSync(id, accounts) {
    const account = accounts.find(ele => {
        return ele._id === id;
    });
    addBrandName(account);
    return account;
}

function findSync(account) {
    const accounts = listSync();
    return _findByIdSync(account._id, accounts);
}

function findById(accountId) {
    return Promise.resolve(findByIdSync(accountId));
}

function findByIdSync(accountId) {
    const accounts = listSync();
    return _findByIdSync(accountId, accounts);
}

function add(account) {
    const id = createIdForAccount(account);
    const accounts = listSync();
    const now = Date.now();
    accounts.push({
        _id: id,
        brand: account.brand,
        appid: account.appid,
        secret: account.secret,
        created: now,
        updated: now
    });
    accountListStore.setSync('list', accounts);
    return Promise.resolve(account);
}

function remove(account) {
    return removeById(account._id);
}

function removeById(accountId) {
    const accounts = listSync();
    const accountIdx = accounts.findIndex(ele => {
        return ele._id === accountId;
    });
    if (accountIdx !== -1) {
        accounts.splice(accountIdx, 1);
        accountListStore.setSync('list', accounts);
        return Promise.resolve({id: accountId});
    } else {
        return Promise.resolve({msg: `no account:${accountIdx}`});
    }
}

function update(account) {
    const accounts = listSync();
    const accountIndex = accounts.findIndex(ele => {
        return ele._id === account._id;
    });
    account.updated = Date.now();
    accounts.splice(accountIndex, 1, account);
    accountListStore.setSync('list', accounts);
    return Promise.resolve(account);
}

function listSync() {
    const accounts = accountListStore.getSync('list', []);
    accounts.forEach(addBrandName);
    return accounts;
}

function list() {
    return Promise.resolve(listSync());
}

function setCurrent(account) {
    currentAccountStore.setSync('current', {id: account._id});
}

function getCurrentSync() {
    const accountData = currentAccountStore.getSync('current');
    return accountData ? findByIdSync(accountData.id) || null : null;
}

export default {
    findSync,
    findById,
    findByIdSync,
    list,
    listSync,
    add,
    update,
    remove,
    removeById,
    setCurrent,
    getCurrentSync
}
