/*
    This module create by: dev.jhernandez@gmail.com
    License: OPL-1
    Please do not modification if i not accept
    Thanks for understand
 */
odoo.define('send_order.buttons', function (require) {
    var screens = require('point_of_sale.screens');

    // Shipment Search
    var button_go_shipment_pos_orders_screen = screens.ActionButtonWidget.extend({ // shipment orders management
        template: 'button_go_shipment_pos_orders_screen',
        button_click: function () {
            this.gui.show_screen('shipment_orders_screen');
        }
    });
    screens.define_action_button({
        'name': 'button_go_shipment_pos_orders_screen',
        'widget': button_go_shipment_pos_orders_screen,
        'condition': function () {
            return this.pos.config.search_pos_orders == true;
        }
    });

    //Shipment Send
    var button_go_send_pos_orders_screen = screens.ActionButtonWidget.extend({ // shipment orders management
        template: 'button_go_send_pos_orders_screen',
        button_click: function () {
            this.send_order();
        },
        send_order: function () {
            // debugger;
            var self = this;

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
                if(self.pos.config.print_shipment_ticket){
                    order.initialize_validation_date();
                    self.gui.show_screen('receipt');
                }
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
    screens.define_action_button({
        'name': 'button_go_send_pos_orders_screen',
        'widget': button_go_send_pos_orders_screen,
        'condition': function () {
            return this.pos.config.send_pos_orders == true && this.pos.config.prohibit_payment == false;
        }
    });
});