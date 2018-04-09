// components/modal/modal.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        modalTitle: {
            type: String,
            value: '请填写'
        },
        hidden: {
            type: Boolean,
            value: true
        },
        from: {
            type: String,
            value: 'aniu'
        }
    },

    options: {
        multipleSlots: true
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        hideKefu: function() {
            this.setData({
                hidden: true
            })
            this.triggerEvent('hide');
        }
    }
})