import {_Page as Page} from "../../../app/hook/index.js";
import accounts from "../../../modules/account/index.js";
import accountSession from "../../../app/account/index.js";
import router from "../router.js";

Page({
    data: {
        accounts: [],
        currentAccountId: null,
        visibleSecrets: {}
    },
    onLoad(query) {
    },
    onShow() {
        this.loadAccounts();
    },
    loadAccounts() {
        accounts.listAccounts().then(accountList => {
            const currentAccount = accountSession.getCurrentAccountSync();
            this.setData({
                accounts: accountList,
                currentAccountId: currentAccount ? currentAccount._id : null
            });
        });
    },
    onTapToggleSecret(e) {
        const id = e.currentTarget.dataset.id;
        const key = `visibleSecrets.${id}`;
        this.setData({
            [key]: !this.data.visibleSecrets[id]
        });
    },
    onTapAccount(e) {
        const id = e.currentTarget.dataset.id;
        const account = accounts.findAccountById(id);
        if (!account) {
            return;
        }
        const action = e.target.dataset.action;
        if (action === 'delete') {
            wx.showModal({
                content: `确定删除账号：${account.appid}（${account.brandName}）吗？`,
                cancelText: '取消',
                confirmText: '删除',
                confirmColor: '#ee0a24',
                success: res => {
                    if (res.confirm) {
                        accounts.removeAccount(id)
                            .then(res => {
                                this.loadAccounts();
                            })
                            .catch(err => {
                                console.error(err);
                                wx.showToast({
                                    title: '删除失败',
                                    icon: 'none'
                                });
                            });
                    }
                }
            });
        } else if (action === 'edit') {
            router.navigateTo({
                name: 'edit',
                params: {
                    id: id
                }
            });
        } else {
            accountSession.changeCurrentAccount(account);
            router.navigateBack();
        }
    },
    onTapNew(e) {
        router.navigateTo({
            name: 'edit'
        });
    },
    onTapHelp(e) {
        getApp().$router.navigateTo({
            name: ['main', 'help'],
        });
    }
});
