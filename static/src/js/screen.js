"use strict";
odoo.define('send_order.screens', function (require) {

    var screens = require('point_of_sale.screens');
    
    screens.ActionpadWidget.include({

        renderElement: function () {
            var self = this;
            this._super();

            this.$('.send').click(function () {
                self.send_order();
            });

        },
        send_order: function () {
            let self = this;

            let order = self.pos.get_order();
            if (order.get_orderlines().length == 0) {
                self.gui.show_popup('error', {
                    'title': 'Error: Orden Sin Productos',
                    'body': 'No se ha agregado productos a la orden, no se puede realiza una precuenta vacia.',
                    'cancel': function () {
                        self.gui.show_screen('products');
                    }
                });

                return;
            }
            order.sender = self.$('.sender').val();
            order.sent_note = self.$('.sent_note').val();
            order.partner_id = order.get_client();
            order.amount_total = order.get_total_with_tax(),
                order.is_sent = true

            self.send_order_to_server({
                ...order.export_as_JSON(),
                id: order.uid.replace(/-/g, '')
            }).then(function () {
                self.pos.pos_bus.push_message_to_other_sessions({
                    data: order['uid'],
                    action: 'sent_order',
                    bus_id: self.pos.config.bus_id[0],
                    order_uid: order['uid']
                });
                self.pos.delete_current_order();
            });

        },
        send_order_to_server: function (order) {
            return this._rpc({
                route: '/pos/send_order',
                params: {
                    'data': {
                        'uid_order': order.uid,
                        'order_data': JSON.stringify(order)
                    }
                }
            });
        },
    });
});