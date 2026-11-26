import accountRepository from './account.repository.js';
import {CLOUD_BRANDS, FEIE, SPYUN, XPYUN} from './cloud-brand.js';

const accounts = {
    FEIE,
    SPYUN,
    XPYUN,
    CLOUD_BRANDS,
    setCurrentAccount(account) {
        return accountRepository.setCurrent(account);
    },
    getCurrentAccountSync() {
        return accountRepository.getCurrentSync();
    },
    getCurrentAccount() {
        const currentAccount = this.getCurrentAccountSync();
        return currentAccount ? Promise.resolve(currentAccount) : Promise.reject({msg: '没有配置开放平台账号'});
    },
    listAccounts() {
        return accountRepository.list();
    },
    findAccountById(id) {
        return accountRepository.findByIdSync(id);
    },
    saveAccount(account) {
        return account._id ? accountRepository.update(account) : accountRepository.add(account);
    },
    removeAccount(id) {
        return accountRepository.removeById(id);
    },
    getAccountFormState(accountId) {
        const currentAccount = accountId ? accountRepository.findByIdSync(decodeURIComponent(accountId)) : {};
        return {
            viewAccount: currentAccount,
            viewBrandIndex: accountId ? CLOUD_BRANDS.findIndex(brand => brand.id === currentAccount.brand) : -1
        };
    },
    getAccountChange(name, value) {
        if (name === 'brand') {
            return {value: CLOUD_BRANDS[value].id, brandIndex: value};
        }
        return {value};
    },
    updateAccount(account, name, value) {
        return {...account, [name]: value};
    },
    validateAccount(account) {
        if (!account.brand) return '请选择开放平台';
        if (!account.appid) return 'AppId输入不能为空';
        if (!account.secret) return 'Secret输入不能为空';
        return '';
    }
};

export default accounts;
