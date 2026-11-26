const {_App, _Page, _Component} = require('@mini-dev/hook');
const {createPageEventHook} = require('@mini-dev/event-hook');

const pageEventHook = createPageEventHook();
_Page.use(pageEventHook);

_Page.use({
    onLoad: {
        before(query) {
            console.log(`[${this.route}]onLoad`, query);
        }
    }
});

export {_App, _Page, _Component};
