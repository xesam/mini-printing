import accounts from '../account/index.js';
import frequentDeviceRepository from './frequent/frequent.repository.js';
import {DeviceTypeLabel, DeviceTypeMessage, DeviceTypes, getDeviceTypeById, isDeviceType} from './device-type.js';
const CloudCore = require('@xesam/cloud-core');

const devices = {
    DeviceTypeLabel,
    DeviceTypeMessage,
    DeviceTypes,
    cloudBrands: accounts.CLOUD_BRANDS,
    getDeviceTypeById,
    getBrandName(brandId) {
        const brand = accounts.CLOUD_BRANDS.find(item => item.id === brandId);
        return brand ? brand.name : '未知';
    },
    normalizeDeviceSn(sn) {
        return (sn || '').trim();
    },
    copiesAfterChange(copies, delta) {
        return Math.min(5, Math.max(1, copies + delta));
    },
    getCopiesLimitMessage(copies, delta) {
        if (delta < 0 && copies === 1) return '最低不能低于 1 份';
        if (delta > 0 && copies === 5) return '最高不能高于 5 份';
        return '';
    },
    buildFrequentDeviceView(device) {
        return {
            ...device,
            listKey: `${device.brand}:${device.deviceId}`,
            brandName: this.getBrandName(device.brand),
            displayName: device.name || device.deviceId,
            typeName: device.type ? (getDeviceTypeById(device.type) || {}).name || '' : ''
        };
    },
    async queryDevice(sn, cloud) {
        const printer = new CloudCore.Device().sn(this.normalizeDeviceSn(sn));
        const result = await cloud.queryDevice(printer);
        return {sn: printer.sn(), online: result.online()};
    },
    async printOrder(sn, content, copies, type, cloud) {
        const printer = new CloudCore.Device().sn(sn);
        const order = new CloudCore.Order().content(content).copies(copies);
        return isDeviceType(type, DeviceTypeMessage)
            ? cloud.printMsgOrder(printer, order)
            : cloud.printLabelOrder(printer, order);
    },
    getFrequentDevices() {
        return frequentDeviceRepository.getDevicesSync().map(item => this.buildFrequentDeviceView(item));
    },
    isFrequent: (brand, id) => frequentDeviceRepository.isFrequentSync(brand, id),
    addFrequent: item => frequentDeviceRepository.addDeviceSync(item),
    updateFrequent: (brand, id, updates) => frequentDeviceRepository.updateDeviceSync(brand, id, updates),
    removeFrequent: (brand, id) => frequentDeviceRepository.removeDeviceSync(brand, id),
    getFrequent: (brand, id) => frequentDeviceRepository.getDeviceSync(brand, id)
};

export default devices;
