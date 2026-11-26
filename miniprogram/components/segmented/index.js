import {_Component as Component} from "../../app/hook/index.js";

Component({
    properties: {
        options: {
            type: Array,
            value: []
        },
        value: {
            type: String,
            value: ''
        }
    },
    methods: {
        onSelect(e) {
            const id = e.currentTarget.dataset.id;
            if (id !== this.data.value) {
                this.triggerEvent('change', {id: id});
            }
        }
    }
});
