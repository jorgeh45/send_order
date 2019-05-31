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
            this.gui.show_screen('send_orders_screen');
        }
    });
    screens.define_action_button({
        'name': 'button_go_send_pos_orders_screen',
        'widget': button_go_send_pos_orders_screen,
        'condition': function () {
            return this.pos.config.send_pos_orders == true;
        }
    });
});
