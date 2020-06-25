/*
    This module create by: dev.jhernandez@gmail.com
    License: OPL-1
    Please do not modification if i not accept
    Thanks for understand
 */
odoo.define('send_order.buttons', function (require) {
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var PopupWidget = require('point_of_sale.popups');
    // Shipment Search
    // var button_go_shipment_pos_orders_screen = screens.ActionButtonWidget.extend({ // shipment orders management
    //     template: 'button_go_shipment_pos_orders_screen',
    //     button_click: function () {
    //         this.gui.show_screen('shipment_orders_screen');
    //     }
    // });
    // screens.define_action_button({
    //     'name': 'button_go_shipment_pos_orders_screen',
    //     'widget': button_go_shipment_pos_orders_screen,
    //     'condition': function () {
    //         return this.pos.config.search_pos_orders == true;
    //     }
    // });

    // //Shipment Send
    // var button_go_send_pos_orders_screen = screens.ActionButtonWidget.extend({ // shipment orders management
    //     template: 'button_go_send_pos_orders_screen',
    //     button_click: function () {
    //         this.send_order();
    //     },
    //     send_order: function () {
    //         var self = this;

    //         let order = self.pos.get_order();
    //         if (order.get_orderlines().length == 0) {
    //             self.gui.show_popup('error', {
    //                 'title': 'Error: Orden Sin Productos',
    //                 'body': 'No se ha agregado productos a la orden, no se puede realiza una precuenta vacia.',
    //                 'cancel': function () {
    //                     self.gui.show_screen('products');
    //                 }
    //             });

    //             return;
    //         }
    //         order.sender = self.$('.sender').val();
    //         order.sent_note = self.$('.sent_note').val();
    //         order.partner_id = order.get_client();
    //         order.amount_total = order.get_total_with_tax(),
    //         order.is_sent = true

    //         self.send_order_to_server({
    //             ...order.export_as_JSON(),
    //             id: order.uid.replace(/-/g, '')
    //         }).then(function () {
    //             self.pos.pos_bus.push_message_to_other_sessions({
    //                 data: order['uid'],
    //                 action: 'sent_order',
    //                 bus_id: self.pos.config.bus_id[0],
    //                 order_uid: order['uid']
    //             });
    //             if(self.pos.config.print_shipment_ticket){
    //                 order.initialize_validation_date();
    //                 self.gui.show_screen('receipt');
    //             }else{
    //                 self.pos.delete_current_order();
    //             }
    //         });

    //     },
    //     send_order_to_server: function (order) {
    //         return this._rpc({
    //             route: '/pos/send_order',
    //             params: {
    //                 'data': {
    //                     'uid_order': order.uid,
    //                     'order_data': JSON.stringify(order)
    //                 }
    //             }
    //         });
    //     },
    // });
    // screens.define_action_button({
    //     'name': 'button_go_send_pos_orders_screen',
    //     'widget': button_go_send_pos_orders_screen,
    //     'condition': function () {
    //         return this.pos.config.send_pos_orders == true && this.pos.config.prohibit_payment == false;
    //     }
    // });


    var ask_password = PopupWidget.extend({
        template: 'ask_password',
        show: function (options) {
            options = options || {};
            this._super(options);
            this.renderElement();
            this.input = this.$('input')
            this.input.focus();
            this.PopupShowUp = false;
            let self = this;

            if (this.pos.config.keyboard_event) {
                this.add_keyboard_events();
                setTimeout(() => {
                    self.PopupShowUp = true;
                }, 100)
            }

        },
        click_confirm: function () {
            var value = this.input.val();
            this.gui.close_popup();
            if (this.options.confirm) {
                this.options.confirm.call(this, value);
            }
        },
        add_keyboard_events: function () {
            let self = this;
            self.input.on("keydown", (event) => {
                if (!self.PopupShowUp) return;
                if (event.keyCode === 13) { // Enter
                    self.click_confirm();
                    self.PopupShowUp = false;
                    event.preventDefault();
                    self.PopupShowUp = false;
                    event.stopPropagation();
                } else if (event.keyCode === 27) { //Esc
                    self.remove_keyboard_events()
                    self.gui.show_screen('products');
                    self.pos.trigger('back:order');
                    event.preventDefault();
                    self.PopupShowUp = false;
                    event.stopPropagation();
                }
            });

        },
        remove_keyboard_events: function () {
            this.input.off("keydown");
        }
    });

    gui.define_popup({
        name: 'ask_password',
        widget: ask_password
    });


    var button_go_send_pos_orders_screen = screens.ActionButtonWidget.extend({ // shipment orders management
        template: 'button_go_send_pos_orders_screen',
        button_click: function () {

            let self = this
            let order = self.pos.get_order();
            if (order.get_orderlines().length > 0) {
                if (self.pos.config.use_password) {

                    self.pos.gui.show_popup('ask_password', {
                        title: 'Blocked',
                        body: 'Please input your pos pass pin',
                        confirm: function (value) {
                            let seller = this.pos.db.get_seller();
                            if (seller && seller.pos_security_pin === value) {
                                self.gui.show_screen('send_orders_screen');
                                return;
                            }
                            var users = self.pos.users;
                            let user = users.find((user) => {
                                return user.pos_security_pin === value
                            })
                            if (!user) {
                                return self.pos.gui.show_popup('confirm', {
                                    title: 'Wrong',
                                    body: 'Password not correct, please check pos security pin',
                                })
                            } else {

                                self.pos.db.set_seller(user);
                                self.gui.show_screen('send_orders_screen');
                            }


                        }
                    });
                } else {

                    self.pos.db.set_seller(order.pos.get_cashier());
                    self.gui.show_screen('send_orders_screen');

                }
            } else {
                self.pos.db.set_seller(false);
                self.gui.show_screen('send_orders_screen');
            }
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