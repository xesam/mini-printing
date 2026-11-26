import {_Page as Page} from "../../app/hook/index.js";
import accountSession from "../../app/account/index.js";
import devices from "../../modules/device/index.js";

Page({
    data: {
        viewAccount: null,
        viewDevice: null,
        searchRawValue: '',
        searchErrorMsg: null,
        searching: false
    },
    onLoad(query) {
        // 监听账号切换事件，自动刷新当前账号显示
        this.$events.on('account:changed', (account) => {
            this.setData({viewAccount: account});
        });
    },
    onShow() {
        this.loadAccount();
    },
    loadAccount() {
        accountSession.getCurrentAccount().then(account => {
            this.setData({
                viewAccount: account
            });
        }).catch(err => {
            console.error(err);
            this.setData({
                viewAccount: null,
                viewDevice: null
            });
        });
    },
    routeToChangeAccount() {
        getApp().$router.navigateTo({
            name: ['account', 'index']
        });
    },
    onTapChangeAccount(e) {
        this.routeToChangeAccount();
    },
    onSearchChanged(e) {
        this.setData({
            searchRawValue: e.detail.value
        });
    },
    onTapClearSearch(e) {
        this.setData({
            searchRawValue: ''
        });
    },
    onTapSearchAction(e) {
        if (this.data.searching) {
            return;
        }
        const inputSn = this.data.searchRawValue.trim();
        if (!inputSn.length) {
            wx.showToast({
                title: '请输入设备的编号',
                icon: 'none'
            });
            return;
        }
        accountSession.getCurrentAccount().then(account => {
            this.setData({
                searching: true
            });
            devices.queryDevice(inputSn, accountSession.getCurrentCloud()).then(device => {
                this.setData({
                    viewDevice: device,
                    searchErrorMsg: null,
                    searching: false
                });
            }).catch(err => {
                console.error(err);
                this.setData({
                    viewDevice: null,
                    searchErrorMsg: err.msg || '查询设备失败',
                    searching: false
                });
            });
        }).catch(err => {
            wx.showModal({
                content: err.msg,
                confirmText: '配置账号',
                cancelText: '取消',
                success: res => {
                    if (res.confirm) {
                        this.routeToChangeAccount();
                    }
                }
            });
        });
    },
    onTapRetrySearch(e) {
        this.onTapSearchAction();
    },
    onTapDevice(e) {
        getApp().$router.navigateTo({
            name: ['device', 'detail'],
            params: {
                sn: this.data.viewDevice.sn
            }
        });
    }
});
