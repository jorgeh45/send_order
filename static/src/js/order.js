/*
    This module create by: thanhchatvn@gmail.com
    License: OPL-1
    Please do not modification if i not accept
    Thanks for understand
 */
odoo.define('send_order.order', function (require) {

    var models = require('point_of_sale.models');
    var rpc = require('web.rpc');
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

    var _super_PosModel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({

        _flush_orders: function () {
            var self = this;
            var transfer = _super_PosModel._flush_orders.apply(this, arguments);
            if (this.config.print_picking_ticket) {
                transfer.pipe(function (order_server_ids) {
                    if (order_server_ids) {
                        for (const key in order_server_ids) {
                            const element = order_server_ids[key];
                            rpc.query({
                                model: 'pos.order',
                                method: 'search_read',
                                args: [
                                    [
                                        ['id', '=', element]
                                    ],
                                    ['picking_id']
                                ],
                            }, {
                                timeout: 10000,
                            }).then((result) => {
                                if (result && result[0].picking_id) {
                                    self.chrome.do_action('stock.action_report_delivery', {
                                        additional_context: {
                                            active_ids: [result[0].picking_id[0]],
                                        }
                                    })
                                }

                            });

                        }
                    }
                });
            }
            return transfer;
        }
    });
});