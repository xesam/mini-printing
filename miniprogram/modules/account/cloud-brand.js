export const FEIE = {
    id: 'FEIE',
    name: '飞鹅'
};
export const XPYUN = {
    id: 'XPYUN',
    name: '芯烨'
};
export const SPYUN = {
    id: 'SPYUN',
    name: '商鹏'
};

export const CLOUD_BRANDS = [FEIE, XPYUN, SPYUN];

export function getBrandById(id) {
    return CLOUD_BRANDS.find(ele => ele.id === id);
}
