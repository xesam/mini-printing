import {_Page as Page} from "../../app/hook/index.js";
import devices from "../../modules/device/index.js";
import accountSession from "../../app/account/index.js";

Page({
    data: {
        devices: [],
        hasDevices: false,
        brandOptions: devices.cloudBrands,
        deviceTypes: devices.DeviceTypes,
        addPanelVisible: false,
        addForm: {
            brand: devices.cloudBrands[0].id,
            deviceId: '',
            type: devices.DeviceTypeMessage.id
        }
    },
    onShow() {
        this.loadDevices();
    },
    loadDevices() {
        const frequentDevices = devices.getFrequentDevices();
        this.setData({
            devices: frequentDevices,
            hasDevices: frequentDevices.length > 0
        });
    },
    onTapDevice(e) {
        const {brand, deviceId} = e.currentTarget.dataset;

        // 详情页按当前账号的厂商查询设备，厂商不一致时会查错或查询失败
        const account = accountSession.getCurrentAccountSync();
        if (!account || account.brand !== brand) {
            wx.showToast({
                title: `该设备属于${devices.getBrandName(brand)}，请先切换到${devices.getBrandName(brand)}账号`,
                icon: 'none',
                duration: 2500
            });
            return;
        }

        getApp().$router.navigateTo({
            name: ['device', 'detail'],
            params: {
                sn: deviceId
            }
        });
    },
    onTapEdit(e) {
        const {brand, deviceId, name, remark, type} = e.currentTarget.dataset;

        wx.showActionSheet({
            itemList: ['修改名称', '修改备注', '修改类型', '移出常用'],
            success: res => {
                if (res.tapIndex === 0) {
                    this.editName(brand, deviceId, name);
                } else if (res.tapIndex === 1) {
                    this.editRemark(brand, deviceId, remark);
                } else if (res.tapIndex === 2) {
                    this.editType(brand, deviceId, type);
                } else if (res.tapIndex === 3) {
                    this.removeDevice(brand, deviceId);
                }
            }
        });
    },
    editName(brand, deviceId, currentName) {
        wx.showModal({
            title: '修改设备名称',
            editable: true,
            placeholderText: currentName || '设备名称',
            success: res => {
                if (res.confirm) {
                    const newName = res.content.trim();
                    devices.updateFrequent(brand, deviceId, {
                        name: newName
                    });
                    wx.showToast({
                        title: '修改成功',
                        icon: 'success'
                    });
                    this.loadDevices();
                }
            }
        });
    },
    editRemark(brand, deviceId, currentRemark) {
        wx.showModal({
            title: '修改设备备注',
            editable: true,
            placeholderText: currentRemark || '备注信息',
            success: res => {
                if (res.confirm) {
                    const newRemark = res.content.trim();
                    devices.updateFrequent(brand, deviceId, {
                        remark: newRemark
                    });
                    wx.showToast({
                        title: '修改成功',
                        icon: 'success'
                    });
                    this.loadDevices();
                }
            }
        });
    },
    editType(brand, deviceId, currentType) {
        wx.showActionSheet({
            itemList: devices.DeviceTypes.map(type => type.name),
            success: res => {
                const selectedType = devices.DeviceTypes[res.tapIndex];
                devices.updateFrequent(brand, deviceId, {
                    type: selectedType.id
                });
                wx.showToast({
                    title: '修改成功',
                    icon: 'success'
                });
                this.loadDevices();
            }
        });
    },
    removeDevice(brand, deviceId) {
        wx.showModal({
            title: '删除常用设备',
            content: '确定要删除该设备吗？',
            confirmColor: '#ee0a24',
            success: res => {
                if (res.confirm) {
                    devices.removeFrequent(brand, deviceId);
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                    this.loadDevices();
                }
            }
        });
    },
    onTapAdd(e) {
        this.openAddPanel();
    },
    openAddPanel() {
        this.setData({
            addPanelVisible: true,
            addForm: {
                brand: devices.cloudBrands[0].id,
                deviceId: '',
                type: devices.DeviceTypeMessage.id
            }
        });
    },
    closeAddPanel() {
        this.setData({
            addPanelVisible: false
        });
    },
    onAddBrandChanged(e) {
        this.setData({
            'addForm.brand': e.detail.id
        });
    },
    onAddSnInput(e) {
        this.setData({
            'addForm.deviceId': e.detail.value
        });
    },
    onAddTypeChanged(e) {
        this.setData({
            'addForm.type': e.detail.id
        });
    },
    onTapAddConfirm(e) {
        const form = this.data.addForm;
        const deviceId = (form.deviceId || '').trim();
        if (!deviceId) {
            wx.showToast({
                title: '设备编号不能为空',
                icon: 'none'
            });
            return;
        }
        if (devices.isFrequent(form.brand, deviceId)) {
            wx.showToast({
                title: '该设备已存在',
                icon: 'none'
            });
            return;
        }
        const success = devices.addFrequent({
            brand: form.brand,
            deviceId: deviceId,
            type: form.type
        });
        if (success) {
            this.closeAddPanel();
            wx.showToast({
                title: '添加成功',
                icon: 'success'
            });
            this.loadDevices();
        } else {
            wx.showToast({
                title: '该设备已存在',
                icon: 'none'
            });
        }
    }
});
