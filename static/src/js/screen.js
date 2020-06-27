"use strict";
odoo.define('send_order.screens', function (require) {

    var screens = require('point_of_sale.screens');
    var models = require('point_of_sale.models');
    var gui = require('point_of_sale.gui');

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
            order.sender = order.pos.get_cashier().name;
            order.partner_id = order.get_client();
            order.amount_total = order.get_total_with_tax(),
                order.is_sent = true

            self.send_order_to_server({
                ...order.export_as_JSON(),
                id: order.uid.replace(/-/g, ''),
                bus_id: 1,

            }).then(function () {

                console.log("Se ha enviado");
                self.pos.delete_current_order();
            });

        },
        send_order_to_server: function (order) {
            return this._rpc({
                route: '/pos/send_order',
                params: {
                    'data': {
                        'uid_order': order.uid,
                        'order_data': JSON.stringify(order),
                    }
                }
            });
        },
    });

    screens.PaymentScreenWidget.include({
        finalize_validation: function () {
            var self = this;
            var order = this.pos.get_order();

            if (order.is_paid_with_cash() && this.pos.config.iface_cashdrawer) {

                this.pos.proxy.open_cashbox();
            }

            order.initialize_validation_date();
            order.finalized = true;

            if (order.is_to_invoice()) {
                var invoiced = this.pos.push_and_invoice_order(order);
                this.invoicing = true;

                invoiced.fail(function (error) {
                    self.invoicing = false;
                    order.finalized = false;
                    if (error.message === 'Missing Customer') {
                        self.gui.show_popup('confirm', {
                            'title': _t('Please select the Customer'),
                            'body': _t('You need to select the customer before you can invoice an order.'),
                            confirm: function () {
                                self.gui.show_screen('clientlist');
                            },
                        });
                    } else if (error.message === 'Backend Invoice') {
                        self.gui.show_popup('confirm', {
                            'title': _t('Please print the invoice from the backend'),
                            'body': _t('The order has been synchronized earlier. Please make the invoice from the backend for the order: ') + error.data.order.name,
                            confirm: function () {
                                this.gui.show_screen('receipt');
                            },
                            cancel: function () {
                                this.gui.show_screen('receipt');
                            },
                        });
                    } else if (error.code < 0) { // XmlHttpRequest Errors
                        self.gui.show_popup('error', {
                            'title': _t('The order could not be sent'),
                            'body': _t('Check your internet connection and try again.'),
                        });
                    } else if (error.code === 200) { // OpenERP Server Errors
                        self.gui.show_popup('error-traceback', {
                            'title': error.data.message || _t("Server Error"),
                            'body': error.data.debug || _t('The server encountered an error while receiving your order.'),
                        });
                    } else { // ???
                        self.gui.show_popup('error', {
                            'title': _t("Unknown Error"),
                            'body': _t("The order could not be sent to the server due to an unknown error"),
                        });
                    }
                });

                invoiced.done(function () {
                    self.invoicing = false;
                    self.gui.show_screen('receipt');

                });
            } else {
                this.pos.push_order(order);
                this.gui.show_screen('receipt');

                if (this.pos.config.print_picking_ticket) {
                    console.log("Imprimir Conduce");
                    this.print_picking(order);

                    //     self.chrome.do_action('point_of_sale.pos_invoice_report',{additional_context:{
                    //         active_ids:order_server_id,
                    //     }}).done(function () {
                    //         invoiced.resolve();
                    //         done.resolve();
                    //     });
                }
            }

        },
        show:function(){
            this._super();
            let order = self.pos.get_order();
            if(order.get_sent_note()){
                $('#order_note').val(order.get_sent_note())
            }
        },
        print_picking: function (order) {

        }
    });

    screens.OrderWidget.include({

        init: function (parent, options) {
            var self = this;
            this._super(parent, options);
            this.last_rows_count = 0;
            // this.OnSenderOrdersPolling();

            this.interval_polling = setInterval(function () {
                self.OnSenderOrdersPolling()
            }, 5000);

            // this.pos.bind('back:order', function () {
            //     clearInterval(self.interval_polling);
            // });

        },
        OnSenderOrdersPolling: function () {
            var self = this;
            console.log(self.pos.config.bus_id[0]);
            this._rpc({
                model: 'pos.order.sent',
                method: 'search_read',
                args: [
                    [
                        ['pos_config_id', '=', self.pos.config.id]
                    ],
                    ['id']
                ]
            }).then(function (result) {
                console.log(result);

                let count = result ? result.length : 0;

                if (self.last_rows_count != count) {
                    self.last_rows_count = count;
                    self.pos.trigger('sync:order_sent');
                    self.showNewOrders();

                }
            });

        },

        getOrderSent: function () {
            return this._rpc({
                route: '/pos/get_orders_sent_by_pos',
                params: {
                    'pos_config_id': this.pos.config.id
                }
            });
        },

        showNewOrders: function () {
            let self = this;
            this.getOrderSent().then((orders) => {
                if (orders) {
                    let count_order = orders.length;
                    let list_orders = [];
                    for (let i = 0; i < count_order; i++) {
                        const order_data = orders[i];
                        const order = order_data.data
                        list_orders.push(order);
                    }
                    if (list_orders.length > 0) {

                        list_orders.forEach(order => {
                            self.createOrders(order);
                        });
                    }
                }

            });
        },

        createOrders: function (order) {
            let self = this;

            this.selectOrderSent(order.uid).then(() => {

                let lines = order.lines;
                let count_lines = lines.length;

                
                let old_order = self.pos.get_order();
                self.pos.add_new_order();
                
                let new_order = self.pos.get_order();
                // var new_order = new models.Order({}, {pos: self.pos, temporary: true});

                for (let i = 0; i < count_lines; i++) {
                    const line = lines[i][2];
                    let product = self.pos.db.get_product_by_id(line.product_id);
                    let cashier = new_order.pos.get_cashier();
                    if (line.seller === cashier.id) {
                        line.is_sent = false;
                    }
                    let new_line = new models.Orderline({}, {
                        pos: self.pos,
                        order: new_order,
                        product: product,
                        json: line
                    });
                    new_order.orderlines.add(new_line);
                }

                if(order.sent_note){
                    new_order.set_sent_note(order.sent_note);
                }
                
                new_order.set_is_sent(true);
                // if (order.partner_id) {
                //     new_order.set_client(self.pos.db.get_partner_by_id(order.partner_id.id) || order.partner_id);
                // }
                // new_order.user_id = order.user_id
                // new_order.seller_cashier = order.seller_cashier;
               


                self.pos.set('selectedOrder', old_order);
                self.pos.trigger('change:selectedOrder');

            });

            

        },

        selectOrderSent: function (uid) {
            //eliminate the order of the list, to avoid
            //another user take
            return this._rpc({
                route: '/pos/delete_order_sent',
                params: {
                    uid: uid
                }
            });
        },

    });

    screens.ReceiptScreenWidget.include({
        click_next: function () {
            let order = this.pos.get_order();
            if (order.is_sent) {
                this.pos.delete_current_order();

            } else {
                order.finalize();
            }

        },

    });

});