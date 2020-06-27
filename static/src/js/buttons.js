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

            if (!self.pos.config.multi_pos_mode) {

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
            } else {

                if (order.get_orderlines().length == 0) {
                    self.gui.show_popup('confirm', {
                        'title': 'Error: Orden Sin Productos',
                        'body': 'No se ha agregado productos a la orden, no se puede realiza una precuenta vacia.',
                        'confirm': function () {
                            self.gui.show_screen('products');
                            self.pos.trigger('back:order');
                        },
                        'cancel': function () {
                            self.gui.show_screen('products');
                            self.pos.trigger('back:order');
                        }
                    });

                    return;
                }

                self.send_order_to_branch();

            }
        },
        send_order_to_branch: function () {
            let self = this;
            this._rpc({
                model: 'pos.config',
                method: 'search_read',
                args: [
                    [
                        ['id', '!=', self.pos.config.id]
                    ],
                    ['id', 'name', ]
                ]
            }).then(function (result) {
                if (result) {

                    var list_pos = result.map((e) => {
                        return {
                            label: e.name,
                            item: e.id,
                        }
                    });

                    self.gui.show_popup("selection", {
                        title: "Sucursales",
                        list: list_pos,
                        confirm: function (item) {
                            self.send_order(item);
                        }
                    });

                } else {
                    self.gui.show_popup('error', {
                        'title': 'Error: Enviar Orden',
                        'body': 'No hay mas sucursales configuradas',
                    });

                }
            });

        },
        send_order: function (brand) {
            var self = this;
            let order = self.pos.get_order();


            order.partner_id = order.get_client();
            order.amount_total = order.get_total_with_tax();
            order.is_sent = true;
            order.seller_cashier = order.pos.get_cashier();


            let lines = order.orderlines.models;
            for (let i = 0; i < lines.length; i++) {
                lines[i].is_sent = true;
                if (!lines[i].seller) {
                    lines[i].seller = order.seller_cashier.id;
                }
            }

            console.log(order.export_as_JSON());
            console.log("Se envio la orden");
            self.send_order_to_server({
                ...order.export_as_JSON(),
                id: order.uid.replace(/-/g, ''),
                bus_id: 1,
                pos_config_id: brand
            }).then(function (response) {

                try {
                    let res = JSON.parse(response);
                    if (res.code == 200) {

                        self.pos.delete_current_order();
                        self.gui.show_screen('products');


                    } else {
                        let mesg = "No se pudo enviar la orden"
                        self.pos.gui.show_popup('error', {
                            title: mesg
                        })
                        console.error(mesg)
                    }

                } catch (error) {
                    let mesg = "No se pudo enviar la orden"
                    self.pos.gui.show_popup('error', {
                        title: "Error  enviando la orden"
                    })
                }

            });

        },
        send_order_to_server: function (order) {

            if (!this.remote_bus) {
                return this._rpc({
                    route: '/pos/send_order',
                    params: {
                        'data': {
                            'uid_order': order.uid,
                            'order_data': JSON.stringify(order),
                            'bus_id': order.bus_id,
                            'pos_config_id': order.pos_config_id
                        }
                    }
                });
            } else {

                let params = {
                    'data': {
                        'uid_order': order.uid,
                        'order_data': JSON.stringify(order),
                        'bus_id': order.bus_id,
                        'pos_config_id': order.pos_config_id
                    }
                }

                return this._rpc({
                    model: 'pos.bus',
                    method: 'create_order_in_another_server',
                    args: [
                        [order.bus_id], params
                    ]
                });

            }
        },

    });

    screens.define_action_button({
        'name': 'button_go_send_pos_orders_screen',
        'widget': button_go_send_pos_orders_screen,
        'condition': function () {
            return this.pos.config.send_pos_orders == true;
        }
    });

    var button_go_send_brand_screen = screens.ActionButtonWidget.extend({ // shipment orders management
        template: 'button_go_send_brand_screen',
        button_click: function () {
            let self = this;
            let order = self.pos.get_order();

            if (order.get_orderlines().length == 0) {
                self.gui.show_popup('confirm', {
                    'title': 'Error: Orden Sin Productos',
                    'body': 'No se ha agregado productos a la orden, no se puede realiza una precuenta vacia.',
                    'confirm': function () {
                        self.gui.show_screen('products');
                        self.pos.trigger('back:order');
                    },
                    'cancel': function () {
                        self.gui.show_screen('products');
                        self.pos.trigger('back:order');
                    }
                });

                return;
            }

            self.send_order_to_branch_remote();


        },
        send_order_to_branch_remote: function () {
            let self = this;
            this._rpc({
                model: 'pos.bus',
                method: 'search_read',
                args: [
                    [
                        ['from_remote_server', '=', true]
                    ],
                    ['id', 'name', 'from_remote_server']
                ]
            }).then(function (result) {
                if (result) {
                    var list_bus = result.map((e) => {
                        return {
                            label: e.name,
                            item: e.id,
                            remote: e.from_remote_server
                        }
                    });

                    self.gui.show_popup("selection", {
                        title: "Branch",
                        list: list_bus,
                        confirm: function (item) {
                            let bus = list_bus.find((bus) => {
                                return bus.item === item
                            })

                            if (bus.remote) {
                                self.remote_bus = true;
                                self.remote_id = item;
                            } else {
                                self.remote_bus = false;
                                self.remote_id = 1;
                            }

                            self.select_pos_config(item);
                        }
                    });


                }
            });

        },
        select_pos_config: function (bus_id) {
            let self = this;
            return this._rpc({
                model: 'pos.bus',
                method: 'get_pos_config_from_another_server',
                args: [
                    [bus_id]
                ]
            }).then(function (result) {
                if (result) {
                    let res = JSON.parse(result);

                    var list_pos_remote = res.data.map((e) => {
                        return {
                            label: e.name,
                            item: e.id,
                        }
                    });



                    self.gui.show_popup("selection", {
                        title: "Puntos de Ventas",
                        list: list_pos_remote,
                        confirm: function (item) {


                            var order = self.pos.get_order();


                            if (order) {
                                self.gui.show_popup('textarea', {
                                    title: _t('Add Order Note'),
                                    value: order.order_note,
                                    confirm: function (note) {
                                        self.send_order(item,note);
                                        // order.trigger('change', order);
                                        // self.show();
                                        // self.renderElement();
                                    },
                                    cancel: function () {
                                        return;
                                    }
                                });
                            }

                        }
                    });


                }
            });

        },
        send_order: function (brand, note = "") {
            var self = this;
            let order = self.pos.get_order();


            order.partner_id = order.get_client();
            order.amount_total = order.get_total_with_tax();
            order.is_sent = true;
            order.seller_cashier = order.pos.get_cashier();
            order.sent_note  = note;


            let lines = order.orderlines.models;
            for (let i = 0; i < lines.length; i++) {
                lines[i].is_sent = true;
                if (!lines[i].seller) {
                    lines[i].seller = order.seller_cashier.id;
                }
            }

            console.log(order.export_as_JSON());
            console.log("Se envio la orden");
            self.send_order_to_server({
                ...order.export_as_JSON(),
                id: order.uid.replace(/-/g, ''),
                bus_id: self.remote_id,
                pos_config_id: brand
            }).then(function (response) {

                try {
                    let res = JSON.parse(response);
                    if (res.code == 200) {

                        self.pos.delete_current_order();
                        self.gui.show_screen('products');


                    } else {
                        let mesg = "No se pudo enviar la orden"
                        self.pos.gui.show_popup('error', {
                            title: mesg
                        })
                        console.error(mesg)
                    }

                } catch (error) {
                    let mesg = "No se pudo enviar la orden"
                    self.pos.gui.show_popup('error', {
                        title: "Error  enviando la orden"
                    })
                }

            });

        },
        send_order_to_server: function (order) {
            if (!this.remote_bus) {
                return this._rpc({
                    route: '/pos/send_order',
                    params: {
                        'data': {
                            'uid_order': order.uid,
                            'order_data': JSON.stringify(order),
                            'bus_id': order.bus_id,
                            'pos_config_id': order.pos_config_id
                        }
                    }
                });
            } else {

                let params = {
                    'data': {
                        'uid_order': order.uid,
                        'order_data': JSON.stringify(order),
                        'bus_id': this.remote_id,
                        'pos_config_id': order.pos_config_id
                    }
                }

                return this._rpc({
                    model: 'pos.bus',
                    method: 'create_order_in_another_server',
                    args: [
                        [this.remote_id], params
                    ]
                });

            }
        },

    });

    screens.define_action_button({
        'name': 'button_go_send_brand_screen',
        'widget': button_go_send_brand_screen,
        'condition': function () {
            return this.pos.config.send_branch == true;
        }
    });


});