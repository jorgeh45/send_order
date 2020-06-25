"use strict";
odoo.define('send_order.screens', function (require) {

    var screens = require('point_of_sale.screens');
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
                }else{
                    self.pos.delete_current_order();
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

    screens.PaymentScreenWidget.include({
        finalize_validation: function() {
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
    
                invoiced.fail(function(error){
                    self.invoicing = false;
                    order.finalized = false;
                    if (error.message === 'Missing Customer') {
                        self.gui.show_popup('confirm',{
                            'title': _t('Please select the Customer'),
                            'body': _t('You need to select the customer before you can invoice an order.'),
                            confirm: function(){
                                self.gui.show_screen('clientlist');
                            },
                        });
                    } else if (error.message === 'Backend Invoice') {
                        self.gui.show_popup('confirm',{
                            'title': _t('Please print the invoice from the backend'),
                            'body': _t('The order has been synchronized earlier. Please make the invoice from the backend for the order: ') + error.data.order.name,
                            confirm: function () {
                                this.gui.show_screen('receipt');
                            },
                            cancel: function () {
                                this.gui.show_screen('receipt');
                            },
                        });
                    } else if (error.code < 0) {        // XmlHttpRequest Errors
                        self.gui.show_popup('error',{
                            'title': _t('The order could not be sent'),
                            'body': _t('Check your internet connection and try again.'),
                        });
                    } else if (error.code === 200) {    // OpenERP Server Errors
                        self.gui.show_popup('error-traceback',{
                            'title': error.data.message || _t("Server Error"),
                            'body': error.data.debug || _t('The server encountered an error while receiving your order.'),
                        });
                    } else {                            // ???
                        self.gui.show_popup('error',{
                            'title': _t("Unknown Error"),
                            'body':  _t("The order could not be sent to the server due to an unknown error"),
                        });
                    }
                });
    
                invoiced.done(function(){
                    self.invoicing = false;
                    self.gui.show_screen('receipt');
  
                });
            } else {
                this.pos.push_order(order);
                this.gui.show_screen('receipt');

                if(this.pos.config.print_picking_ticket){
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
        print_picking:function(order){

        }
    });


 
});