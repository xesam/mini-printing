import {_Page as Page} from "../../app/hook/index.js";
import devices from "../../modules/device/index.js";
import accountSession from "../../app/account/index.js";

Page({
    data: {
        deviceTypes: devices.DeviceTypes,
        rawSn: null,
        viewAccount: null,
        viewDeviceType: devices.DeviceTypeMessage,
        viewInputContent: '',
        viewInputCopies: 1,
        printing: false
    },
    onLoad(query) {
        const sn = query.sn;
        accountSession.getCurrentAccount().then(account => {
            this.setData({
                viewAccount: account,
                rawSn: sn
            });
        }).catch(err => {
            console.error(err);
        });
    },
    onDeviceTypeChanged(e) {
        const deviceType = devices.getDeviceTypeById(e.detail.id);
        if (deviceType) {
            this.setData({
                viewDeviceType: deviceType
            });
        }
    },
    onContentChanged(e) {
        this.setData({
            viewInputContent: e.detail.value
        });
    },
    onTapCtrlAction(e) {
        const actionName = e.target.dataset.action;
        if (actionName === 'clear') {
            this.setData({
                viewInputContent: ''
            });
        } else if (actionName === 'copy') {
            wx.setClipboardData({
                data: this.data.viewInputContent,
                success(res) {
                    wx.showToast({
                        title: '已复制',
                        icon: 'success'
                    });
                }
            });
        }
    },
    onCopiesChanged(e) {
        this.setData({
            viewInputCopies: e.detail.value
        });
    },
    onTapSend(e) {
        if (this.data.printing) {
            return;
        }
        if (!this.data.viewInputContent.trim().length) {
            wx.showToast({
                title: '请输入打印内容',
                icon: 'none'
            });
            return;
        }
        this.setData({
            printing: true
        });
        devices.printOrder(this.data.rawSn, this.data.viewInputContent, this.data.viewInputCopies, this.data.viewDeviceType, accountSession.getCurrentCloud())
            .then(() => {
                this.setData({
                    printing: false
                });
                wx.showToast({
                    title: '已发送订单，请查看设备打印结果',
                    icon: 'none',
                    duration: 2500
                });
            })
            .catch(err => {
                this.setData({
                    printing: false
                });
                console.error(err);
                wx.showToast({
                    title: '发送订单失败：' + (err && err.msg ? err.msg : JSON.stringify(err)),
                    icon: 'none',
                    duration: 3000
                });
            });
    }
});
