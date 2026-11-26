import {_Page as Page} from "../../../app/hook/index.js";
import accounts from "../../../modules/account/index.js";
import router from "../router.js";

const ACTION_CREATE = 'create';
const ACTION_EDIT = 'edit';

Page({
    data: {
        viewBrands: accounts.CLOUD_BRANDS,
        viewBrandIndex: -1,
        actionType: ACTION_EDIT,
        viewAccount: {},
        secretVisible: false,
        saving: false,
        title: '编辑账号'
    },
    onLoad(query) {
        this.setData({
            ...accounts.getAccountFormState(query.id),
            actionType: query.id ? ACTION_EDIT : ACTION_CREATE,
            title: query.id ? '编辑账号' : '新增账号'
        });
    },
    onMiniItemChanged(e) {
        const {value, brandIndex} = accounts.getAccountChange(e.target.dataset.name, e.detail.value);
        const account = accounts.updateAccount(this.data.viewAccount, e.target.dataset.name, value);
        const update = {viewAccount: account};
        if (brandIndex !== undefined) update.viewBrandIndex = brandIndex;
        this.setData(update);
    },
    onTapToggleSecret(e) {
        this.setData({
            secretVisible: !this.data.secretVisible
        });
    },
    onTapSave(e) {
        if (this.data.saving) {
            return;
        }
        const validationMessage = accounts.validateAccount(this.data.viewAccount);
        if (validationMessage) {
            wx.showToast({
                title: validationMessage,
                icon: 'none'
            });
            return;
        }
        this.setData({
            saving: true
        });
        accounts.saveAccount(this.data.viewAccount)
            .then(() => {
                router.navigateBack();
            })
            .catch(err => {
                console.error(err);
                this.setData({
                    saving: false
                });
                wx.showToast({
                    title: '保存失败',
                    icon: 'none'
                });
            });
    },
    onTapHelp(e) {
        getApp().$router.navigateTo({
            name: ['main', 'help']
        });
    }
});
