/*
    This module create by: dev.jhernandez@gmail.com
    License: OPL-1
    Please do not modification if i not accept
    Thanks for understand
 */
"use strict";
odoo.define('send_order.screen_shipment_orders', function (require) {

    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    var qweb = core.qweb;


    // var shipment_orders_screen = screens.ScreenWidget.extend({
    //     template: 'shipment_orders_screen',
    //     init: function (parent, options) {
    //         var self = this;
    //         this.reverse = true;
    //         this._super(parent, options);
    //         this.pos_order_cache = new screens.DomCache();


    //     },
    //     show: function () {
    //         this._super();
    //         let self = this;

    //         this.show_orders();

    //         var input = this.el.querySelector('.searchbox input');
    //         input.value = '';
    //         input.focus();

    //         this.pos.bind('sync:order_sent', function () {

    //             self.get_orders_sent().then((orders) => {
    //                 if (orders) {
    //                     let count_order = orders.length;
    //                     let list_orders = [];
    //                     for (let i = 0; i < count_order; i++) {
    //                         const order_data = orders[i];
    //                         const order = order_data.data
    //                         list_orders.push(order);
    //                     }
    //                     self.pos.db.save_data_sync_sent_order(list_orders);

    //                     if (!input.value) {
    //                         self.render_shipment_order_list(self.pos.db.shipment_orders_store);
    //                     } else {
    //                         self.perform_search(input.value);
    //                     }
    //                 }
    //             });


    //         });

    //     },
    //     renderElement: function () {

    //         this.search_orders = [];
    //         var self = this;

    //         this._super();
    //         this.$('.back').click(function () {
    //             self.gui.show_screen('products');
    //         });
    //         var $search_box = $('.search-pos-order >input');
    //         if ($search_box) {
    //             $search_box.autocomplete({
    //                 source: this.pos.db.shipment_orders_autocomplete,
    //                 minLength: this.pos.config.min_length_search,
    //                 select: function (event, ui) {
    //                     if (ui && ui['item'] && ui['item']['value']) {
    //                         var order = self.pos.db.shipment_order_by_id[ui['item']['value']];
    //                         // self.display_pos_order_detail(order);
    //                         setTimeout(function () {
    //                             self.clear_search();
    //                         }, 1000);

    //                     }
    //                 }
    //             });
    //         }
    //         var search_timeout = null;
    //         // this.render_shipment_order_list(this.pos.db.shipment_orders_store);
    //         this.$('.client-list-contents').delegate('.pos_order_row', 'click', function (event) {

    //             self.order_select(event, $(this), $(this).data('id').replace(/-/g, ''));
    //         });
    //         var search_timeout = null;
    //         if (this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard) {
    //             this.chrome.widget.keyboard.connect(this.$('.searchbox input'));
    //         }
    //         this.$('.searchbox input').on('keypress', function (event) {
    //             clearTimeout(search_timeout);
    //             var searchbox = this;
    //             search_timeout = setTimeout(function () {
    //                 self.perform_search(searchbox.value, event.which === 13);
    //             }, 70);
    //         });
    //         this.$('.searchbox .search-clear').click(function () {
    //             self.clear_search();
    //         });
    //         this.$('.sort_by_pos_order_id').click(function () {
    //             if (self.search_orders.length == 0) {
    //                 self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('id', self.reverse, parseInt));
    //                 self.render_shipment_order_list(self.pos.db.shipment_orders_store);
    //                 self.reverse = !self.reverse;
    //             } else {
    //                 self.search_orders = self.search_orders.sort(self.pos.sort_by('id', self.reverse, parseInt));
    //                 self.render_shipment_order_list(self.search_orders);
    //                 self.reverse = !self.reverse;
    //             }
    //         });
    //         this.$('.sort_by_pos_order_amount_total').click(function () {
    //             if (self.search_orders.length == 0) {
    //                 self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('amount_total', self.reverse, parseInt));
    //                 self.render_shipment_order_list(self.pos.db.shipment_orders_store);
    //                 self.reverse = !self.reverse;
    //             } else {
    //                 self.search_orders = self.search_orders.sort(self.pos.sort_by('amount_total', self.reverse, parseInt));
    //                 self.render_shipment_order_list(self.search_orders);
    //                 self.reverse = !self.reverse;
    //             }

    //         });
    //         this.$('.sort_by_pos_order_amount_paid').click(function () {
    //             if (self.search_orders.length == 0) {
    //                 self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('amount_paid', self.reverse, parseInt));
    //                 self.render_shipment_order_list(self.pos.db.shipment_orders_store);
    //                 self.reverse = !self.reverse;
    //             } else {
    //                 self.search_orders = self.search_orders.sort(self.pos.sort_by('amount_paid', self.reverse, parseInt));
    //                 self.render_shipment_order_list(self.search_orders);
    //                 self.reverse = !self.reverse;
    //             }

    //         });
    //         this.$('.sort_by_pos_order_amount_tax').click(function () {
    //             if (self.search_orders.length == 0) {
    //                 self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('amount_tax', self.reverse, parseInt));
    //                 self.render_shipment_order_list(self.pos.db.shipment_orders_store);
    //                 self.reverse = !self.reverse;
    //             } else {
    //                 self.search_orders = self.search_orders.sort(self.pos.sort_by('amount_tax', self.reverse, parseInt));
    //                 self.render_shipment_order_list(self.search_orders);
    //                 self.reverse = !self.reverse;
    //             }

    //         });
    //         this.$('.sort_by_pos_order_name').click(function () {
    //             if (self.search_orders.length == 0) {
    //                 self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('name', self.reverse, function (a) {
    //                     if (!a) {
    //                         a = 'N/A';
    //                     }
    //                     return a.toUpperCase()
    //                 }));
    //                 self.render_shipment_order_list(self.pos.db.shipment_orders_store);
    //                 self.reverse = !self.reverse;
    //             } else {
    //                 self.search_orders = self.search_orders.sort(self.pos.sort_by('name', self.reverse, function (a) {
    //                     if (!a) {
    //                         a = 'N/A';
    //                     }
    //                     return a.toUpperCase()
    //                 }));
    //                 self.render_shipment_order_list(self.search_orders);
    //                 self.reverse = !self.reverse;
    //             }
    //         });
    //         this.$('.sort_by_pos_order_partner_name').click(function () {
    //             if (self.search_orders.length == 0) {
    //                 self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('partner_name', self.reverse, function (a) {
    //                     if (!a) {
    //                         a = 'N/A';
    //                     }
    //                     return a.toUpperCase()
    //                 }));
    //                 self.render_shipment_order_list(self.pos.db.shipment_orders_store);
    //                 self.reverse = !self.reverse;
    //             } else {
    //                 self.search_orders = self.search_orders.sort(self.pos.sort_by('partner_name', self.reverse, function (a) {
    //                     if (!a) {
    //                         a = 'N/A';
    //                     }
    //                     return a.toUpperCase()
    //                 }));
    //                 self.render_shipment_order_list(self.search_orders);
    //                 self.reverse = !self.reverse;
    //             }
    //         });
    //         this.$('.sort_by_pos_order_barcode').click(function () {
    //             if (self.search_orders.length == 0) {
    //                 self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('ean13', self.reverse, function (a) {
    //                     if (!a) {
    //                         a = 'N/A';
    //                     }
    //                     return a.toUpperCase();
    //                 }));
    //                 self.render_shipment_order_list(self.pos.db.shipment_orders_store);
    //                 self.reverse = !self.reverse;
    //             } else {
    //                 self.search_orders = self.search_orders.sort(self.pos.sort_by('ean13', self.reverse, function (a) {
    //                     if (!a) {
    //                         a = 'N/A';
    //                     }
    //                     return a.toUpperCase();
    //                 }));
    //                 self.render_shipment_order_list(self.search_orders);
    //                 self.reverse = !self.reverse;
    //             }
    //         });
    //         this.$('.sort_by_pos_order_state').click(function () {
    //             if (self.search_orders.length == 0) {
    //                 self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('state', self.reverse, function (a) {
    //                     if (!a) {
    //                         a = 'N/A';
    //                     }
    //                     return a.toUpperCase();
    //                 }));
    //                 self.render_shipment_order_list(self.pos.db.shipment_orders_store);
    //                 self.reverse = !self.reverse;
    //             } else {
    //                 self.search_orders = self.search_orders.sort(self.pos.sort_by('state', self.reverse, function (a) {
    //                     if (!a) {
    //                         a = 'N/A';
    //                     }
    //                     return a.toUpperCase();
    //                 }));
    //                 self.render_shipment_order_list(self.search_orders);
    //                 self.reverse = !self.reverse;
    //             }
    //         });


    //     },
    //     clear_search: function () {
    //         this.render_shipment_order_list(this.pos.db.shipment_orders_store);
    //         this.$('.searchbox input')[0].value = '';
    //         this.$('.searchbox input').focus();
    //         this.search_orders = [];
    //     },
    //     perform_search: function (query, associate_result) {
    //         var orders;
    //         if (query) {
    //             orders = this.pos.db.search_shipment_order(query);
    //             if (associate_result && orders.length === 1) {
    //                 return this.display_pos_order_detail(orders[0]);
    //             }
    //             this.search_orders = orders;
    //             return this.render_shipment_order_list(orders);

    //         } else {
    //             orders = this.pos.db.shipment_orders_store;
    //             return this.render_shipment_order_list(orders);
    //         }
    //     },
    //     partner_icon_url: function (id) {
    //         return '/web/image?model=res.partner&id=' + id + '&field=image_small';
    //     },
    //     order_select: function (event, $order, id) {
    //         let order = this.pos.db.shipment_order_by_id[id];

    //         this.select_order_sent(order.uid).then(() => {

    //             this.pos.pos_bus.push_message_to_other_sessions({
    //                 data: order['uid'],
    //                 action: 'sent_order',
    //                 bus_id: this.pos.config.bus_id[0],
    //                 order_uid: order['uid']
    //             });

    //             let lines = order.lines;
    //             let count_lines = lines.length;

    //             this.pos.add_new_order();
    //             let new_order = this.pos.get_order();

    //             for (let i = 0; i < count_lines; i++) {
    //                 const line = lines[i][2];
    //                 let product = this.pos.db.get_product_by_id(line.product_id);
    //                 new_order.add_product(product, {
    //                     quantity: line.qty,
    //                     price: line.price_unit,
    //                     discount: line.discount
    //                 });
    //             }

    //             if (order.partner_id) {
    //                 new_order.set_client(this.pos.db.get_partner_by_id(order.partner_id.id) || order.partner_id);
    //             }
    //         });

    //         this.gui.show_screen('products');
    //     },
    //     render_sent_order_list: function (orders) {

    //         var contents = this.$el[0].querySelector('.pos_order_list');
    //         contents.innerHTML = "";
    //         let count_orders = orders.length;
    //         for (var i = 0, len = Math.min(count_orders, 1000); i < len; i++) {
    //             let order_data = orders[i];
    //             let order = order_data.data;

    //             var pos_order_row = this.pos_order_cache.get_node(order.id);
    //             if (!pos_order_row) {
    //                 var pos_order_row_html = qweb.render('pos_order_row', {
    //                     widget: this,
    //                     order: order
    //                 });
    //                 var pos_order_row = document.createElement('tbody');
    //                 pos_order_row.innerHTML = pos_order_row_html;
    //                 pos_order_row = pos_order_row.childNodes[1];
    //                 this.pos_order_cache.cache_node(order.id, pos_order_row);
    //             }
    //             if (order === this.order_selected) {
    //                 pos_order_row.classList.add('highlight');
    //             } else {
    //                 pos_order_row.classList.remove('highlight');
    //             }
    //             contents.appendChild(pos_order_row);
    //         }


    //     },
    //     render_shipment_order_list: function (orders) {

    //         var contents = this.$el[0].querySelector('.pos_order_list');
    //         contents.innerHTML = "";
    //         let count_orders = orders.length;
    //         for (var i = 0, len = Math.min(count_orders, 1000); i < len; i++) {
    //             let order = orders[i];
    //             var pos_order_row = this.pos_order_cache.get_node(order.id);
    //             if (!pos_order_row) {
    //                 var pos_order_row_html = qweb.render('pos_order_row', {
    //                     widget: this,
    //                     order: order
    //                 });
    //                 var pos_order_row = document.createElement('tbody');
    //                 pos_order_row.innerHTML = pos_order_row_html;
    //                 pos_order_row = pos_order_row.childNodes[1];
    //                 this.pos_order_cache.cache_node(order.id, pos_order_row);
    //             }
    //             if (order === this.order_selected) {
    //                 pos_order_row.classList.add('highlight');
    //             } else {
    //                 pos_order_row.classList.remove('highlight');
    //             }
    //             contents.appendChild(pos_order_row);
    //         }


    //     },

    //     render_shipment_order_list_backup: function (orders) {

    //         var contents = this.$el[0].querySelector('.pos_order_list');
    //         contents.innerHTML = "";
    //         for (var i = 0, len = Math.min(orders.length, 1000); i < len; i++) {
    //             var order = orders[i];
    //             var pos_order_row = this.pos_order_cache.get_node(order.id);
    //             if (!pos_order_row) {
    //                 var pos_order_row_html = qweb.render('pos_order_row', {
    //                     widget: this,
    //                     order: order
    //                 });
    //                 var pos_order_row = document.createElement('tbody');
    //                 pos_order_row.innerHTML = pos_order_row_html;
    //                 pos_order_row = pos_order_row.childNodes[1];
    //                 this.pos_order_cache.cache_node(order.id, pos_order_row);
    //             }
    //             if (order === this.order_selected) {
    //                 pos_order_row.classList.add('highlight');
    //             } else {
    //                 pos_order_row.classList.remove('highlight');
    //             }
    //             contents.appendChild(pos_order_row);
    //         }


    //     },
    //     hide_order_selected: function () { // hide when re-print receipt
    //         var contents = this.$('.pos_detail');
    //         contents.empty();
    //         this.order_selected = null;

    //     },
    //     display_pos_order_detail: function (order) {
    //         var contents = this.$('.pos_detail');
    //         contents.empty();
    //         var self = this;
    //         this.order_selected = order;
    //         if (!order) {
    //             return;
    //         }
    //         order['link'] = window.location.origin + "/web#id=" + order.id + "&view_type=form&model=pos.order";
    //         contents.append($(qweb.render('pos_order_detail', {
    //             widget: this,
    //             order: order
    //         })));
    //         var lines = this.pos.db.shipment_lines_by_order_id[order['id']];
    //         if (lines) {
    //             var line_contents = this.$('.lines_detail');
    //             line_contents.empty();
    //             line_contents.append($(qweb.render('pos_order_lines', {
    //                 widget: this,
    //                 lines: lines
    //             })));
    //         };
    //         this.$('.return_order').click(function () {
    //             var order = self.order_selected;
    //             var order_lines = self.pos.db.shipment_lines_by_order_id[order.id];
    //             if (!order_lines) {
    //                 return self.gui.show_popup('confirm', {
    //                     title: 'Warning',
    //                     body: 'Order empty lines',
    //                 });
    //             } else {
    //                 return self.gui.show_popup('popup_return_pos_order_lines', {
    //                     order_lines: order_lines,
    //                     order: order
    //                 });
    //             }
    //         });
    //         this.$('.register_amount').click(function () {
    //             var pos_order = self.order_selected;
    //             if (pos_order) {
    //                 self.gui.show_popup('popup_register_payment', {
    //                     pos_order: pos_order
    //                 })
    //             }
    //         });

    //     },
    //     show_orders: function () {

    //         this.get_orders_sent().then((orders) => {
    //             if (orders) {
    //                 let count_order = orders.length;
    //                 let list_orders = [];
    //                 for (let i = 0; i < count_order; i++) {
    //                     const order_data = orders[i];
    //                     const order = order_data.data
    //                     list_orders.push(order);
    //                 }
    //                 this.pos.db.save_data_sync_sent_order(list_orders);
    //                 this.render_shipment_order_list(this.pos.db.shipment_orders_store);
    //             }
    //         });

    //     },
    //     get_orders_sent: function () {
    //         return this._rpc({
    //             route: '/pos/get_orders_sent'
    //         });
    //     },
    //     select_order_sent: function (uid) {
    //         //eliminate the order of the list, to avoid
    //         //another user take
    //         return this._rpc({
    //             route: '/pos/delete_order_sent',
    //             params: {
    //                 uid: uid
    //             }
    //         });
    //     }

    // });

    // gui.define_screen({
    //     name: 'shipment_orders_screen',
    //     widget: shipment_orders_screen
    // });


    var send_orders_screen = screens.ScreenWidget.extend({
        template: 'send_orders_screen',
        init: function (parent, options) {
            var self = this;
            this.reverse = true;
            this._super(parent, options);
            this.scroll;

            this.pos_order_cache = new screens.DomCache();
            this.pos.bind('sync:pos_order', function () {
                self.hide_order_selected();
                self.renderElement();
            });

            this.seller = false;
            this.line_list_ship = []

            this.pos.bind('back:product', function () {
                self.gui.back();
                self.pos.trigger('back:order');
            });

            this.last_rows_count = 0;
            this.remote_bus = false;
            this.interval_polling  = false;
            this.check_bus();

            // setInterval(function(){ alert("Hello"); }, 3000);
            this.OnSenderOrdersPolling();

            this.pos.bind('back:order', function () {
                clearInterval(self.interval_polling);
            });

        },
        OnSenderOrdersPolling:function(){
            var self = this;
            console.log(self.pos.config.bus_id[0]);
            this._rpc({
                model: 'pos.order.sent',
                method: 'search_read',
                args: [
                    [
                        ['bus_id', '=', self.pos.config.bus_id[0]]
                    ],
                    ['id']
                ]
            }).then(function (result) {
                console.log(result);

                let count = result ? result.length : 0;

                if(self.last_rows_count != count){

                    
                    self.last_rows_count = count;
                    self.pos.trigger('sync:order_sent');

                }
            });

        },
        check_bus:function(){
            let self = this;

            this._rpc({
                model: 'pos.bus',
                method: 'search_read',
                args: [
                    [
                        ['id', '=', self.pos.config.bus_id[0]]
                    ],
                    ['id', 'name', 'from_remote_server']
                ]
            }).then(function (result) {
                if (result) {
                    let remote = result[0].from_remote_server
                    if(remote){
                        self.remote_bus = true;
                    }
                }
            });
        },
        show: function () {

            this._super();
            this.scroll = this.el.querySelector('.touch-scrollable');

            let self = this;
            this.remote_bus = false;
            self.seller = this.pos.db.get_seller();
            let note = this.$('.sent_note');
            let send_branch = this.$('.send_shipment_to_branch');
            note.val('');
            if (self.seller) {
                this.$('.sender').val(self.seller.name);
                note.focus();
                note.prop('readonly', false);
                send_branch.prop('readonly', false);
                self.is_line_to_call = true;
            } else {
                this.$('.sender').val('');
                note.prop('readonly', true);
                send_branch.prop('readonly', true);
            }

            this.pos.bind('sync:order_sent', function () {
                console.log("Sync de orders");
                self.show_orders();
            });


            this.show_orders();

            this.interval_polling = setInterval(function(){ self.OnSenderOrdersPolling() }, 5000);

        },
        show_orders: function () {
            let self = this;

            this.get_orders_sent().then((orders) => {
                if (orders) {
                    let count_order = orders.length;
                    let list_orders = [];
                    for (let i = 0; i < count_order; i++) {
                        const order_data = orders[i];
                        const order = order_data.data
                        list_orders.push(order);
                    }
                    this.pos.db.save_data_sync_sent_order(list_orders);
                    this.render_shipment_order_list(this.pos.db.shipment_orders_store);
                }
            });

        },
        renderElement: function () {

            this.search_orders = [];
            var self = this;

            this._super();
            this.$('.back').click(function () {

                // self.gui.show_screen('products');
                self.gui.back();
                self.pos.trigger('back:order');

            });

            this.$('.send_shipment').click(function () {
                // if (self.$('.sent_note').val().length > 0) {

                    self.send_order(self.pos.config.bus_id[0]);
                    self.pos.trigger('back:order');
                // } else {
                //     self.$('.sent_note').focus();
                // }
            });

            this.$('.send_shipment_to_branch').click(function () {
                if (self.$('.sent_note').val().length > 0) {

                    self.send_order_to_branch();
                    self.pos.trigger('back:order');
                } else {
                    self.$('.sent_note').focus();
                }

            });

            this.$('.client-list-contents').delegate('.pos_order_row', 'click', function (event) {
                self.order_select(event, $(this), $(this).data('id').replace(/-/g, ''));
            });

        },

        order_select: function (event, $order, id) {
            let self = this;
            let order = self.pos.db.shipment_order_by_id[id];

            this.select_order_sent(order.uid).then(() => {

                this.pos.pos_bus.push_message_to_other_sessions({
                    data: order['uid'],
                    action: 'sent_order',
                    bus_id: this.pos.config.bus_id[0],
                    order_uid: order['uid']
                });

                let lines = order.lines;
                let count_lines = lines.length;

                self.pos.add_new_order();
                let new_order = self.pos.get_order();
                //var new_order = new models.Order({}, {pos: self.pos, temporary: true});

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
                let last_line = new_order.orderlines.models.find((line) => {
                    return line.is_sent === false;
                });
                if (last_line) {
                    new_order.select_orderline(last_line);
                }

                if (order.partner_id) {
                    new_order.set_client(self.pos.db.get_partner_by_id(order.partner_id.id) || order.partner_id);
                }
                // new_order.user_id = order.user_id
                new_order.seller_cashier = order.seller_cashier;
                new_order.is_sent = true;

                new_order.sent_note = order.sent_note;

                self.pos.set('selectedOrder', new_order);

                self.gui.show_screen('products');
                self.pos.trigger('back:order');

            });
            self.pos.trigger('back:product');

        },
        render_shipment_order_list: function (orders) {

            var contents = this.$el[0].querySelector('.pos_order_list');
            contents.innerHTML = "";
            let count_orders = orders.length;
            for (var i = 0, len = Math.min(count_orders, 1000); i < len; i++) {
                let order = orders[i];
                var sent_order_row = this.pos_order_cache.get_node(order.id);
                if (!sent_order_row) {
                    var sent_order_row_html = qweb.render('sent_order_row', {
                        widget: this,
                        order: order
                    });
                    var sent_order_row = document.createElement('tbody');
                    sent_order_row.innerHTML = sent_order_row_html;
                    sent_order_row = sent_order_row.childNodes[1];
                    this.pos_order_cache.cache_node(order.id, sent_order_row);
                }
                contents.appendChild(sent_order_row);
            }


        },
        hide_order_selected: function () { // hide when re-print receipt
            var contents = this.$('.pos_detail');
            contents.empty();
            this.order_selected = null;

        },
        display_pos_order_detail: function (order) {

        },
        send_order: function (bus_id) {
            var self = this;
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
            order.sender = self.$('.sender').val();
            order.sent_note = self.$('.sent_note').val();
            order.partner_id = order.get_client();
            order.amount_total = order.get_total_with_tax();
            order.is_sent = true;
            order.seller_cashier = this.pos.db.get_seller();


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
                bus_id: bus_id
            }).then(function (response) {

                try {
                    
                
                    let res = JSON.parse(response);
                    if (res.code == 200) {

                        self.pos.pos_bus.push_message_to_other_sessions({
                            data: order['uid'],
                            action: 'sent_order',
                            bus_id: bus_id,
                            order_uid: order['uid']
                        });
                        self.pos.delete_current_order();
                        self.gui.show_screen('products');


                    } else {
                        let mesg = "No se pudo enviar la orden"
                        self.pos.gui.show_popup('dialog', {
                            title: mesg
                        })
                        console.error(mesg)
                    }

                } catch (error) {
                    let mesg = "No se pudo enviar la orden"
                    self.pos.gui.show_popup('dialog', {
                        title: "Error  enviando la orden"
                    })
                }

            });

        },
        send_order_to_branch: function () {
            let self = this;
            this._rpc({
                model: 'pos.bus',
                method: 'search_read',
                args: [
                    [
                        ['id', '!=', self.pos.config.bus_id[0]]
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
                            
                            if(bus.remote){
                                self.remote_bus = true;
                            }
                            self.send_order(item);
                        }
                    });


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
                            'bus_id': order.bus_id
                        }
                    }
                });
            } else {

                let params = {
                    'data': {
                        'uid_order': order.uid,
                        'order_data': JSON.stringify(order),
                        'bus_id': order.bus_id
                    }
                }

                return this._rpc({
                    model: 'pos.bus',
                    method: 'create_order_in_another_server',
                    args: [[order.bus_id], params]
                });

            }
        },
        get_orders_sent: function () {
            return this._rpc({
                route: '/pos/get_orders_sent',
                params: {
                    'bus_id': this.pos.config.bus_id[0]
                }
            });
        },
        select_order_sent: function (uid) {
            //eliminate the order of the list, to avoid
            //another user take
            return this._rpc({
                route: '/pos/delete_order_sent',
                params: {
                    uid: uid
                }
            });
        },
        remove_select_line: function (line) {
            this.selected_line = line;
            $(this.list_selector + ' .highlight').removeClass('highlight');
        },

        get_lines: function () {
            this.line_list_ship = Array.from($(".list_values_ship").children());
            this.select_line(this.line_list_ship[0]);
        },

        change_selected_line: function (keycode) {

            let self = this;
            let lines_count = this.line_list_ship.length;
            if (!lines_count > 0) {
                self.is_line_to_call = true;
                return;
            }

            if (self.is_line_to_call && keycode == 38 || keycode == 37) {
                return;
            }

            let line_selected = this.selected_line || false

            if (!line_selected) {
                self.select_line(this.line_list_ship[0]);
            }
            self.$('.sent_note').blur();
            self.is_line_to_call = false;

            if (line_selected && lines_count > 0) {
                let line_selected_id = $(line_selected).data('id');

                for (var i = 0; i < lines_count; i++) {
                    let line_check_id = $(this.line_list_ship[i]).data('id');

                    if (line_check_id == line_selected_id) {

                        if (keycode == 38 || keycode == 37) { //UP-RIGHT
                            if (i === 0) {
                                if (self.seller) {
                                    self.is_line_to_call = true;
                                    // let line_will_select = this.line_list_ship[i];
                                    self.remove_select_line(false);



                                    this.$('.sent_note').focus();
                                } else {
                                    break;
                                }
                            } else if ((i - 1) >= 0 && (i - 1) != -1) {

                                if (self.scroll.scrollTop > 0) {
                                    self.scroll.scrollTop = self.scroll.scrollTop - 30;
                                }

                                let line_will_select = this.line_list_ship[i - 1];
                                self.select_line(line_will_select);
                                break;
                            } else if ((i - 1) === -1) {
                                self.select_line(false);
                                break;
                            }
                        } else {
                            if ((i + 1) === lines_count) break;
                            self.scroll.scrollTop = self.scroll.scrollTop + 30;
                            let line_will_select = this.line_list_ship[i + 1];
                            self.select_line(line_will_select);
                            break;
                        }
                    }
                }
            }


        },
        call_selected_line: function (id) {
            if (!this.is_line_to_call) {
                this.order_select(null, null, id.replace(/-/g, ''));
            } else {
                if (this.$('.sent_note').val().length > 0) {
                    this.deactive_keyboard();
                    this.send_order(this.pos.config.bus_id[0]);
                } else {
                    this.$('.sent_note').focus();
                }
            }
        }

    });

    gui.define_screen({
        name: 'send_orders_screen',
        widget: send_orders_screen
    });


});