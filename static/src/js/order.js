/*
    This module create by: thanhchatvn@gmail.com
    License: OPL-1
    Please do not modification if i not accept
    Thanks for understand
 */
odoo.define('send_order.order', function(require) {

    var models = require('point_of_sale.models');
    var rpc = require('web.rpc');
    var core = require('web.core');
    var _t = core._t;


    models.load_fields('pos.config', ['use_password', 'multi_pos_mode', 'send_brands']);

    var _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({

        init_from_JSON: function(json) {
            var res = _super_Order.init_from_JSON.apply(this, arguments);

            if (json.parent_id) {
                this.parent_id = json.parent_id;
            }

            if (json.note) {
                this.note = json.note
            }

            if (json.sender) {
                this.sender = json.sender;
            }

            if (json.seller_cashier) {
                this.seller_cashier = json.seller_cashier;
                this.user_id = json.seller_cashier.id;
            }

            if (json.cashier_id) {
                this.cashier_id = json.cashier_id.id;
            }

            if (json.from_another_server) {
                this.from_another_server = json.from_another_server;
            }

            if (json.order_note) {
                this.order_note = json.order_note;
            }

            this.is_sent = json.is_sent || false;
            this.sent_note = json.sent_note || '';

            return res;
        },

        export_as_JSON: function() {
            var json = _super_Order.export_as_JSON.apply(this, arguments);

            if (this.parent_id) {
                json.parent_id = this.parent_id;
            }

            if (this.partner_id) {
                json.partner_id = this.partner_id;
            }

            if (this.sender) {
                json.sender = this.sender;
            }

            if (this.sent_note) {
                json.sent_note = this.sent_note;
            }
            if (this.seller_cashier) {
                json.seller_cashier = this.seller_cashier;
                json.user_id = this.seller_cashier.id;
            }

            if (this.cashier_id) {
                json.cashier_id = this.cashier_id.id;
            }

            if (this.from_another_server) {
                json.from_another_server = this.from_another_server;
            }

            if (this.is_sent) {
                json.is_sent = this.is_sent;
            }

            return json;
        },
        get_sent_note: function() {
            return this.sent_note;
        },
        set_sent_note: function(note) {
            this.sent_note = note;
        },
        get_is_sent: function() {
            return this.is_sent;
        },
        set_is_sent: function(val) {
            this.is_sent = val;
        }
    });


    var _super_Orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        init_from_JSON: function(json) {
            var res = _super_Orderline.init_from_JSON.apply(this, arguments);

            this.is_sent = json.is_sent || false;

            if (json.seller) {
                this.seller = json.seller;
            }

            return res;
        },
        export_as_JSON: function() {
            var json = _super_Orderline.export_as_JSON.apply(this, arguments);

            if (this.is_sent) {
                json.is_sent = this.is_sent;
            }

            if (this.seller) {
                json.seller = this.seller;
            }


            return json;
        },
        set_product_lot: function(product) {
            if (product) { // first install may be have old orders, this is reason made bug
                return _super_Orderline.set_product_lot.apply(this, arguments);
            } else {
                return null
            }
        },
    });

    var _super_PosModel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({

        _flush_orders: function() {
            var self = this;
            var transfer = _super_PosModel._flush_orders.apply(this, arguments);
            if (this.config.print_picking_ticket) {
                transfer.pipe(function(order_server_ids) {
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