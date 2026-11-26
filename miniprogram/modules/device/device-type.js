const MESSAGE = {
    id: 'message',
    name: '小票机'
};
const LABEL = {
    id: 'label',
    name: '标签机'
};

export const DeviceTypeMessage = MESSAGE;
export const DeviceTypeLabel = LABEL;
export const DeviceTypes = [MESSAGE, LABEL];

export function isDeviceType(checkedType, expectType) {
    return checkedType.id === expectType.id;
}

export function getDeviceTypeById(id) {
    return DeviceTypes.find(ele => ele.id === id);
}
