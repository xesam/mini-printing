import {_Page as Page} from "../../../app/hook/index.js";
import router from "../router.js";
import devices from "../../../modules/device/index.js";
import accountSession from "../../../app/account/index.js";

Page({
    data: {
        rawSn: null,
        viewAccount: null,
        viewDevice: null,
        isFrequent: false,
        loading: false,
        loadError: null
    },
    onLoad(query) {
        const sn = query.sn;
        this.setData({
            rawSn: sn
        });
    },
    onShow() {
        this.loadDevice();
    },
    loadDevice() {
        accountSession.getCurrentAccount().then(async account => {
            this.setData({
                loading: true,
                loadError: null
            });
            try {
                const device = await devices.queryDevice(this.data.rawSn, accountSession.getCurrentCloud());
                const isFrequent = Boolean(devices.getFrequent(account.brand, this.data.rawSn));
                this.setData({
                    viewAccount: account,
                    viewDevice: device,
                    isFrequent: isFrequent,
                    loading: false
                });
            } catch (err) {
                console.error('加载设备失败:', err);
                this.setData({
                    loading: false,
                    loadError: err.msg || '无法查询设备信息'
                });
            }
        }).catch(err => {
            console.error('加载设备失败:', err);
            this.setData({
                loading: false,
                loadError: err.msg || '没有配置开放平台账号'
            });
        });
    },
    onTapRetry(e) {
        this.loadDevice();
    },
    onTapPrint(e) {
        getApp().$router.navigateTo({
            name: ['main', 'print'],
            params: {
                sn: this.data.rawSn
            }
        });
    },
    onTapAddFrequent(e) {
        const brand = (accountSession.getCurrentAccountSync() || {}).brand || 'UNKNOWN';
        const deviceId = this.data.rawSn;
        // 加入常用 - 先选择设备类型
        wx.showActionSheet({
            itemList: devices.DeviceTypes.map(type => type.name),
            success: res => {
                const selectedType = devices.DeviceTypes[res.tapIndex];
                this.addToFrequent(brand, deviceId, selectedType.id);
            }
        });
    },
    addToFrequent(brand, deviceId, typeId) {
        const success = devices.addFrequent({
            brand: brand,
            deviceId: deviceId,
            type: typeId
        });

        if (success) {
            this.setData({
                isFrequent: true
            });
            wx.showToast({
                title: '已加入常用',
                icon: 'success'
            });
        } else {
            wx.showToast({
                title: '该设备已在常用列表',
                icon: 'none'
            });
        }
    }
});
