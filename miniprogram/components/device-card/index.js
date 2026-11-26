import {_Component as Component} from "../../app/hook/index.js";

Component({
    properties: {
        sn: {
            type: String,
            value: ''
        },
        brand: {
            type: String,
            value: ''
        },
        brandName: {
            type: String,
            value: ''
        },
        online: {
            type: Boolean,
            value: false
        },
        showStatus: {
            type: Boolean,
            value: true
        },
        large: {
            type: Boolean,
            value: false
        },
        copyable: {
            type: Boolean,
            value: false
        }
    },
    methods: {
        onTapCopy() {
            const sn = this.data.sn;
            if (!sn) {
                return;
            }
            wx.setClipboardData({
                data: sn
            });
        }
    }
});
