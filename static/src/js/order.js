/*
    This module create by: thanhchatvn@gmail.com
    License: OPL-1
    Please do not modification if i not accept
    Thanks for understand
 */
odoo.define('send_order.order', function (require) {

    var models = require('point_of_sale.models');
    var core = require('web.core');
    var _t = core._t;

    var _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({

        export_as_JSON: function () {
            var json = _super_Order.export_as_JSON.apply(this, arguments);
           
            if (this.parent_id) {
                json.parent_id = this.parent_id;
            }

            if (this.partner_id) {
                json.partner_id = this.partner_id;
            }
            return json;
        }
    });
});