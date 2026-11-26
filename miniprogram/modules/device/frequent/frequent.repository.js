const { createStorage } = require('@mini-dev/storage-wx');

const STORAGE_KEY = 'app.frequent-devices';

/**
 * 常用设备管理器
 * 存储格式：Array<{brand, deviceId, name?, remark?, addedAt, lastUsedAt?}>
 * 注意：与开发者账号无关，按设备维度独立存储
 * deviceId（实际为设备 sn）可能在不同厂商间重复，因此 brand + deviceId 才是唯一标识
 */
const frequentDeviceStore = createStorage({
    namespace: STORAGE_KEY,
    defaultTtl: 180 * 24 * 3600 * 1000  // 180 天过期
});

class FrequentDeviceRepository {
    /**
     * 获取所有常用设备列表
     * @returns {Array} 常用设备列表，按添加时间倒序
     */
    getDevicesSync() {
        const devices = frequentDeviceStore.getSync('devices') || [];
        return devices.sort((a, b) => b.addedAt - a.addedAt);
    }

    /**
     * 添加常用设备
     * @param {Object} frequentDevice 产品层常用设备信息 {brand, deviceId, type?, name?, remark?}
     * @returns {boolean} 是否添加成功
     */
    addDeviceSync(frequentDevice) {
        if (!frequentDevice.brand || !frequentDevice.deviceId) {
            throw new Error('设备信息不完整：必须包含 brand、deviceId');
        }

        const devices = frequentDeviceStore.getSync('devices') || [];

        // 检查是否已存在（brand + deviceId 组合判断）
        const exists = devices.some(d => d.brand === frequentDevice.brand && d.deviceId === frequentDevice.deviceId);
        if (exists) {
            return false;
        }

        const newDevice = {
            brand: frequentDevice.brand,
            deviceId: frequentDevice.deviceId,
            name: frequentDevice.name || '',
            remark: frequentDevice.remark || '',
            addedAt: Date.now()
        };

        // 如果传入了 type，则保存
        if (frequentDevice.type) {
            newDevice.type = frequentDevice.type;
        }

        devices.push(newDevice);

        frequentDeviceStore.setSync('devices', devices);
        return true;
    }

    /**
     * 更新常用设备信息
     * @param {string} brand 厂商标识
     * @param {string} deviceId 设备号
     * @param {Object} updates 要更新的字段 {type?, name?, remark?}
     * @returns {boolean} 是否更新成功
     */
    updateDeviceSync(brand, deviceId, updates) {
        const devices = frequentDeviceStore.getSync('devices') || [];
        const device = devices.find(d => d.brand === brand && d.deviceId === deviceId);

        if (!device) {
            return false;
        }

        // 允许更新 type、name 和 remark
        if (updates.type !== undefined) {
            device.type = updates.type;
        }
        if (updates.name !== undefined) {
            device.name = updates.name;
        }
        if (updates.remark !== undefined) {
            device.remark = updates.remark;
        }

        frequentDeviceStore.setSync('devices', devices);
        return true;
    }

    /**
     * 删除常用设备
     * @param {string} brand 厂商标识
     * @param {string} deviceId 设备号
     * @returns {boolean} 是否删除成功
     */
    removeDeviceSync(brand, deviceId) {
        const devices = frequentDeviceStore.getSync('devices') || [];
        const index = devices.findIndex(d => d.brand === brand && d.deviceId === deviceId);

        if (index === -1) {
            return false;
        }

        devices.splice(index, 1);
        frequentDeviceStore.setSync('devices', devices);
        return true;
    }

    /**
     * 检查设备是否在常用列表中
     * @param {string} brand 厂商标识
     * @param {string} deviceId 设备号
     * @returns {boolean}
     */
    isFrequentSync(brand, deviceId) {
        const devices = frequentDeviceStore.getSync('devices') || [];
        return devices.some(d => d.brand === brand && d.deviceId === deviceId);
    }

    /**
     * 获取指定设备信息
     * @param {string} brand 厂商标识
     * @param {string} deviceId 设备号
     * @returns {Object|null}
     */
    getDeviceSync(brand, deviceId) {
        const devices = frequentDeviceStore.getSync('devices') || [];
        return devices.find(d => d.brand === brand && d.deviceId === deviceId) || null;
    }

    /**
     * 更新设备最后使用时间
     * @param {string} brand 厂商标识
     * @param {string} deviceId 设备号
     */
    touchDeviceSync(brand, deviceId) {
        const devices = frequentDeviceStore.getSync('devices') || [];
        const device = devices.find(d => d.brand === brand && d.deviceId === deviceId);

        if (device) {
            device.lastUsedAt = Date.now();
            frequentDeviceStore.setSync('devices', devices);
        }
    }

    /**
     * 清空所有常用设备
     */
    clearAllSync() {
        frequentDeviceStore.setSync('devices', []);
    }
}

const frequentDeviceRepository = new FrequentDeviceRepository();

module.exports = frequentDeviceRepository;
