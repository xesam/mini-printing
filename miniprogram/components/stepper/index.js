import {_Component as Component} from "../../app/hook/index.js";

Component({
    properties: {
        value: {
            type: Number,
            value: 1
        },
        min: {
            type: Number,
            value: 1
        },
        max: {
            type: Number,
            value: 5
        }
    },
    methods: {
        onTapDecrease() {
            this.changeValue(-1);
        },
        onTapIncrease() {
            this.changeValue(1);
        },
        changeValue(delta) {
            const next = this.data.value + delta;
            if (next < this.data.min) {
                wx.showToast({
                    title: `最低不能低于 ${this.data.min} 份`,
                    icon: 'none'
                });
                return;
            }
            if (next > this.data.max) {
                wx.showToast({
                    title: `最高不能高于 ${this.data.max} 份`,
                    icon: 'none'
                });
                return;
            }
            this.triggerEvent('change', {value: next});
        }
    }
});
