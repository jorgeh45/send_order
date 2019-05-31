/*
    This module create by: dev.jhernandez@gmail.com
    License: OPL-1
    Please do not modification if i not accept
    Thanks for understand
 */
"use strict";
odoo.define('send_order.screen_shipment_orders', function (require) {

    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var gui = require('point_of_sale.gui');
    var rpc = require('pos.rpc');
    var qweb = core.qweb;


    var shipment_orders_screen = screens.ScreenWidget.extend({
        template: 'shipment_orders_screen',
        init: function (parent, options) {
            var self = this;
            this.reverse = true;
            this._super(parent, options);
            this.pos_order_cache = new screens.DomCache();
            console.log("Shipment se inicio");

        },
        show: function () {
            this._super();
            let self = this;

            this.show_orders();

            var input = this.el.querySelector('.searchbox input');
            input.value = '';
            input.focus();

            this.pos.bind('sync:order_sent', function () {
                console.log("sync:order_sent: Shipments Screen");
             
                    self.get_orders_sent().then((orders) => {
                        if (orders) {
                            let count_order = orders.length;
                            let list_orders = [];
                            for (let i = 0; i < count_order; i++) {
                                const order_data = orders[i];
                                const order = order_data.data
                                list_orders.push(order);
                            }
                            self.pos.db.save_data_sync_sent_order(list_orders);

                            if(!input.value){          
                                self.render_shipment_order_list(self.pos.db.shipment_orders_store);
                            }else{
                                self.perform_search(input.value);
                            }
                        }
                    });
        
                
            });

        },
        renderElement: function () {

            this.search_orders = [];
            var self = this;

            this._super();
            this.$('.back').click(function () {
                self.gui.show_screen('products');
            });
            var $search_box = $('.search-pos-order >input');
            if ($search_box) {
                $search_box.autocomplete({
                    source: this.pos.db.shipment_orders_autocomplete,
                    minLength: this.pos.config.min_length_search,
                    select: function (event, ui) {
                        if (ui && ui['item'] && ui['item']['value']) {
                            var order = self.pos.db.shipment_order_by_id[ui['item']['value']];
                            // self.display_pos_order_detail(order);
                            setTimeout(function () {
                                self.clear_search();
                            }, 1000);

                        }
                    }
                });
            }
            var search_timeout = null;
            // this.render_shipment_order_list(this.pos.db.shipment_orders_store);
            this.$('.client-list-contents').delegate('.pos_order_row', 'click', function (event) {

                self.order_select(event, $(this), $(this).data('id').replace(/-/g, ''));
            });
            var search_timeout = null;
            if (this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard) {
                this.chrome.widget.keyboard.connect(this.$('.searchbox input'));
            }
            this.$('.searchbox input').on('keypress', function (event) {
                clearTimeout(search_timeout);
                var searchbox = this;
                search_timeout = setTimeout(function () {
                    self.perform_search(searchbox.value, event.which === 13);
                }, 70);
            });
            this.$('.searchbox .search-clear').click(function () {
                self.clear_search();
            });
            this.$('.sort_by_pos_order_id').click(function () {
                if (self.search_orders.length == 0) {
                    self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('id', self.reverse, parseInt));
                    self.render_shipment_order_list(self.pos.db.shipment_orders_store);
                    self.reverse = !self.reverse;
                } else {
                    self.search_orders = self.search_orders.sort(self.pos.sort_by('id', self.reverse, parseInt));
                    self.render_shipment_order_list(self.search_orders);
                    self.reverse = !self.reverse;
                }
            });
            this.$('.sort_by_pos_order_amount_total').click(function () {
                if (self.search_orders.length == 0) {
                    self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('amount_total', self.reverse, parseInt));
                    self.render_shipment_order_list(self.pos.db.shipment_orders_store);
                    self.reverse = !self.reverse;
                } else {
                    self.search_orders = self.search_orders.sort(self.pos.sort_by('amount_total', self.reverse, parseInt));
                    self.render_shipment_order_list(self.search_orders);
                    self.reverse = !self.reverse;
                }

            });
            this.$('.sort_by_pos_order_amount_paid').click(function () {
                if (self.search_orders.length == 0) {
                    self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('amount_paid', self.reverse, parseInt));
                    self.render_shipment_order_list(self.pos.db.shipment_orders_store);
                    self.reverse = !self.reverse;
                } else {
                    self.search_orders = self.search_orders.sort(self.pos.sort_by('amount_paid', self.reverse, parseInt));
                    self.render_shipment_order_list(self.search_orders);
                    self.reverse = !self.reverse;
                }

            });
            this.$('.sort_by_pos_order_amount_tax').click(function () {
                if (self.search_orders.length == 0) {
                    self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('amount_tax', self.reverse, parseInt));
                    self.render_shipment_order_list(self.pos.db.shipment_orders_store);
                    self.reverse = !self.reverse;
                } else {
                    self.search_orders = self.search_orders.sort(self.pos.sort_by('amount_tax', self.reverse, parseInt));
                    self.render_shipment_order_list(self.search_orders);
                    self.reverse = !self.reverse;
                }

            });
            this.$('.sort_by_pos_order_name').click(function () {
                if (self.search_orders.length == 0) {
                    self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('name', self.reverse, function (a) {
                        if (!a) {
                            a = 'N/A';
                        }
                        return a.toUpperCase()
                    }));
                    self.render_shipment_order_list(self.pos.db.shipment_orders_store);
                    self.reverse = !self.reverse;
                } else {
                    self.search_orders = self.search_orders.sort(self.pos.sort_by('name', self.reverse, function (a) {
                        if (!a) {
                            a = 'N/A';
                        }
                        return a.toUpperCase()
                    }));
                    self.render_shipment_order_list(self.search_orders);
                    self.reverse = !self.reverse;
                }
            });
            this.$('.sort_by_pos_order_partner_name').click(function () {
                if (self.search_orders.length == 0) {
                    self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('partner_name', self.reverse, function (a) {
                        if (!a) {
                            a = 'N/A';
                        }
                        return a.toUpperCase()
                    }));
                    self.render_shipment_order_list(self.pos.db.shipment_orders_store);
                    self.reverse = !self.reverse;
                } else {
                    self.search_orders = self.search_orders.sort(self.pos.sort_by('partner_name', self.reverse, function (a) {
                        if (!a) {
                            a = 'N/A';
                        }
                        return a.toUpperCase()
                    }));
                    self.render_shipment_order_list(self.search_orders);
                    self.reverse = !self.reverse;
                }
            });
            this.$('.sort_by_pos_order_barcode').click(function () {
                if (self.search_orders.length == 0) {
                    self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('ean13', self.reverse, function (a) {
                        if (!a) {
                            a = 'N/A';
                        }
                        return a.toUpperCase();
                    }));
                    self.render_shipment_order_list(self.pos.db.shipment_orders_store);
                    self.reverse = !self.reverse;
                } else {
                    self.search_orders = self.search_orders.sort(self.pos.sort_by('ean13', self.reverse, function (a) {
                        if (!a) {
                            a = 'N/A';
                        }
                        return a.toUpperCase();
                    }));
                    self.render_shipment_order_list(self.search_orders);
                    self.reverse = !self.reverse;
                }
            });
            this.$('.sort_by_pos_order_state').click(function () {
                if (self.search_orders.length == 0) {
                    self.pos.db.shipment_orders_store = self.pos.db.shipment_orders_store.sort(self.pos.sort_by('state', self.reverse, function (a) {
                        if (!a) {
                            a = 'N/A';
                        }
                        return a.toUpperCase();
                    }));
                    self.render_shipment_order_list(self.pos.db.shipment_orders_store);
                    self.reverse = !self.reverse;
                } else {
                    self.search_orders = self.search_orders.sort(self.pos.sort_by('state', self.reverse, function (a) {
                        if (!a) {
                            a = 'N/A';
                        }
                        return a.toUpperCase();
                    }));
                    self.render_shipment_order_list(self.search_orders);
                    self.reverse = !self.reverse;
                }
            });



            console.log("Shipment se renderizo");

        },
        clear_search: function () {
            this.render_shipment_order_list(this.pos.db.shipment_orders_store);
            this.$('.searchbox input')[0].value = '';
            this.$('.searchbox input').focus();
            this.search_orders = [];
        },
        perform_search: function (query, associate_result) {
            var orders;
            if (query) {
                orders = this.pos.db.search_shipment_order(query);
                if (associate_result && orders.length === 1) {
                    return this.display_pos_order_detail(orders[0]);
                }
                this.search_orders = orders;
                return this.render_shipment_order_list(orders);

            } else {
                orders = this.pos.db.shipment_orders_store;
                return this.render_shipment_order_list(orders);
            }
        },
        partner_icon_url: function (id) {
            return '/web/image?model=res.partner&id=' + id + '&field=image_small';
        },
        order_select: function (event, $order, id) {
            // debugger
            let order = this.pos.db.shipment_order_by_id[id];

            this.select_order_sent(order.uid).then(() => {

                this.pos.pos_bus.push_message_to_other_sessions({
                    data: order['uid'],
                    action: 'sent_order',
                    bus_id: this.pos.config.bus_id[0],
                    order_uid: order['uid']
                });

                let lines = order.lines;
                let count_lines = lines.length;

                this.pos.add_new_order();
                let new_order = this.pos.get_order();

                for (let i = 0; i < count_lines; i++) {
                    const line = lines[i][2];
                    let product = this.pos.db.get_product_by_id(line.product_id);
                    new_order.add_product(product, {
                        quantity: line.qty,
                        price: line.price_unit,
                        discount: line.discount
                    });

                }


            });





            // for (var i = 0; i < order_line_data.length; i++) {
            //     if (order_line_data[i].order_id[0] == this.id) {
            //         var product = self.pos.db.get_product_by_id(order_line_data[i].product_id[0]);
            //         new_order.add_product(product, {quantity: order_line_data[i].qty});
            //     }
            // }
            this.gui.show_screen('products');

            // this.$('.client-line').removeClass('highlight');
            // $order.addClass('highlight');
            // this.display_pos_order_detail(order);
            // this.order_selected = order;
        },
        render_sent_order_list: function (orders) {

            var contents = this.$el[0].querySelector('.pos_order_list');
            contents.innerHTML = "";
            let count_orders = orders.length;
            for (var i = 0, len = Math.min(count_orders, 1000); i < len; i++) {
                let order_data = orders[i];
                let order = order_data.data;

                var pos_order_row = this.pos_order_cache.get_node(order.id);
                if (!pos_order_row) {
                    var pos_order_row_html = qweb.render('pos_order_row', {
                        widget: this,
                        order: order
                    });
                    var pos_order_row = document.createElement('tbody');
                    pos_order_row.innerHTML = pos_order_row_html;
                    pos_order_row = pos_order_row.childNodes[1];
                    this.pos_order_cache.cache_node(order.id, pos_order_row);
                }
                if (order === this.order_selected) {
                    pos_order_row.classList.add('highlight');
                } else {
                    pos_order_row.classList.remove('highlight');
                }
                contents.appendChild(pos_order_row);
            }


        },
        render_shipment_order_list: function (orders) {

            var contents = this.$el[0].querySelector('.pos_order_list');
            contents.innerHTML = "";
            let count_orders = orders.length;
            for (var i = 0, len = Math.min(count_orders, 1000); i < len; i++) {
                let order = orders[i];
                var pos_order_row = this.pos_order_cache.get_node(order.id);
                if (!pos_order_row) {
                    var pos_order_row_html = qweb.render('pos_order_row', {
                        widget: this,
                        order: order
                    });
                    var pos_order_row = document.createElement('tbody');
                    pos_order_row.innerHTML = pos_order_row_html;
                    pos_order_row = pos_order_row.childNodes[1];
                    this.pos_order_cache.cache_node(order.id, pos_order_row);
                }
                if (order === this.order_selected) {
                    pos_order_row.classList.add('highlight');
                } else {
                    pos_order_row.classList.remove('highlight');
                }
                contents.appendChild(pos_order_row);
            }


        },

        render_shipment_order_list_backup: function (orders) {

            var contents = this.$el[0].querySelector('.pos_order_list');
            contents.innerHTML = "";
            for (var i = 0, len = Math.min(orders.length, 1000); i < len; i++) {
                var order = orders[i];
                var pos_order_row = this.pos_order_cache.get_node(order.id);
                if (!pos_order_row) {
                    var pos_order_row_html = qweb.render('pos_order_row', {
                        widget: this,
                        order: order
                    });
                    var pos_order_row = document.createElement('tbody');
                    pos_order_row.innerHTML = pos_order_row_html;
                    pos_order_row = pos_order_row.childNodes[1];
                    this.pos_order_cache.cache_node(order.id, pos_order_row);
                }
                if (order === this.order_selected) {
                    pos_order_row.classList.add('highlight');
                } else {
                    pos_order_row.classList.remove('highlight');
                }
                contents.appendChild(pos_order_row);
            }


        },
        hide_order_selected: function () { // hide when re-print receipt
            var contents = this.$('.pos_detail');
            contents.empty();
            this.order_selected = null;

        },
        display_pos_order_detail: function (order) {
            var contents = this.$('.pos_detail');
            contents.empty();
            var self = this;
            this.order_selected = order;
            if (!order) {
                return;
            }
            order['link'] = window.location.origin + "/web#id=" + order.id + "&view_type=form&model=pos.order";
            contents.append($(qweb.render('pos_order_detail', {
                widget: this,
                order: order
            })));
            var lines = this.pos.db.shipment_lines_by_order_id[order['id']];
            if (lines) {
                var line_contents = this.$('.lines_detail');
                line_contents.empty();
                line_contents.append($(qweb.render('pos_order_lines', {
                    widget: this,
                    lines: lines
                })));
            };
            this.$('.return_order').click(function () {
                var order = self.order_selected;
                var order_lines = self.pos.db.shipment_lines_by_order_id[order.id];
                if (!order_lines) {
                    return self.gui.show_popup('confirm', {
                        title: 'Warning',
                        body: 'Order empty lines',
                    });
                } else {
                    return self.gui.show_popup('popup_return_pos_order_lines', {
                        order_lines: order_lines,
                        order: order
                    });
                }
            });
            this.$('.register_amount').click(function () {
                var pos_order = self.order_selected;
                if (pos_order) {
                    self.gui.show_popup('popup_register_payment', {
                        pos_order: pos_order
                    })
                }
            });
            this.$('.create_invoice').click(function () {
                var pos_order = self.order_selected;
                if (pos_order) {
                    return self.gui.show_popup('confirm', {
                        title: 'Create invoice ?',
                        body: 'Are you want create invoice for ' + pos_order['name'] + ' ?',
                        confirm: function () {
                            self.pos.gui.close_popup();
                            return rpc.query({
                                model: 'pos.order',
                                method: 'made_invoice',
                                args: [
                                    [pos_order['id']]
                                ],
                                context: {
                                    pos: true
                                }
                            }).then(function (invoice_vals) {
                                self.link = window.location.origin + "/web#id=" + invoice_vals[0]['id'] + "&view_type=form&model=account.invoice";
                                return self.gui.show_popup('confirm', {
                                    title: 'Are you want open invoice?',
                                    body: 'Invoice created',
                                    confirmButtonText: 'Yes',
                                    cancelButtonText: 'Close',
                                    confirm: function () {
                                        window.open(self.link, '_blank');
                                    },
                                    cancel: function () {
                                        self.pos.gui.close_popup();
                                    }
                                });
                            }).fail(function (type, error) {
                                return self.pos.query_backend_fail(type, error);
                            });
                        },
                        cancel: function () {
                            return self.pos.gui.close_popup();
                        }
                    });
                }
            });
            this.$('.reprint_order').click(function () {
                var order = self.order_selected;
                if (!order) {
                    return;
                }
                var date = null;
                if ([11, 12].indexOf(self.pos.server_version) != -1) {
                    date = self.pos.format_date(order['date_order'])
                }
                var json = {
                    'date': date,
                    'sequence_number': order['sequence_number'],
                    'name': order.name,
                    'partner_id': null,
                    'lines': [],
                    'amount_total': order.amount_total,
                    'uid': order['uid'],
                    'statement_ids': [],
                    'id': order.id,
                    'ean13': order.ean13
                };
                if (order.partner_id) {
                    json['partner_id'] = order.partner_id[0];
                }
                if (order.invoice_id) {
                    json['invoice_number'] = order.invoice_id[1].split(" ")[0];
                    json['invoice_id'] = order.invoice_id;
                }
                if (order.fiscal_position_id) {
                    json['fiscal_position_id'] = order.fiscal_position_id[0];
                }
                if (order.note) {
                    json['note'] = order.note;
                }
                var lines = self.pos.db.shipment_lines_by_order_id[order.id];
                if (lines) {
                    for (var i in lines) {
                        var line = lines[i];
                        json['lines'].push([0, 0, {
                            'price_unit': line.price_unit,
                            'qty': line.qty,
                            'product_id': line.product_id[0],
                            'discount': line.discount,
                            'pack_lot_ids': [],
                            'id': line.id
                        }])
                    }
                } else {
                    var lines = self.pos.db.shipment_lines_by_order_id[order['id']];
                    for (var i = 0; i < lines.length; i++) {
                        lines[i][2].qty = -lines[i][2].qty
                    }
                    json.lines = order.lines;
                }
                if (order) {
                    var order_temporary = new models.Order({}, {
                        pos: self.pos,
                        json: json,
                        temporary: true
                    });
                    if (json['invoice_number']) {
                        order_temporary['invoice_number'] = json['invoice_number'];
                    }
                    if (json['invoice_id']) {
                        order_temporary['invoice_id'] = json['invoice_id'];
                    }
                    var orders = self.pos.get('orders');
                    orders.add(order_temporary);
                    self.pos.set('selectedOrder', order_temporary);
                    self.pos.gui.show_screen('receipt');
                    self.hide_order_selected();
                }
            });
            this.$('.action_pos_order_cancel').click(function () {
                var order = self.order_selected;
                self.pos.gui.show_popup('confirm', {
                    title: 'Warning',
                    body: 'Are you sure cancel order ' + order['name'] + ' ?',
                    confirm: function () {
                        return rpc.query({
                            model: 'pos.order',
                            method: 'action_pos_order_cancel',
                            args: [
                                [self.order_selected['id']]
                            ],
                            context: {
                                pos: true
                            }
                        }).then(function () {
                            self.display_pos_order_detail(null);
                            self.pos.gui.show_popup('confirm', {
                                title: 'Done',
                                body: 'Order just processed to cancel'
                            });
                            var orders = _.filter(self.pos.db.shipment_orders_store, function (order) {
                                return order['state'] != 'paid' && order['state'] != 'done' && order['state'] != 'invoiced' && order['state'] != 'cancel'
                            });
                            self.render_shipment_order_list(orders);
                            return self.pos.gui.close_popup();
                        }).fail(function (type, error) {
                            return self.pos.query_backend_fail(type, error);
                        })
                    },
                    cancel: function () {
                        return self.pos.gui.close_popup();
                    }
                })
            })
        },
        show_orders: function () {

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
        get_orders_sent: function () {
            return this._rpc({
                route: '/pos/get_orders_sent'
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
        }

    });

    gui.define_screen({
        name: 'shipment_orders_screen',
        widget: shipment_orders_screen
    });

    var send_orders_screen = screens.ScreenWidget.extend({
        template: 'send_orders_screen',
        init: function (parent, options) {
            var self = this;
            this.reverse = true;
            this._super(parent, options);
            this.pos_order_cache = new screens.DomCache();
            this.pos.bind('sync:pos_order', function () {
                self.hide_order_selected();
                self.renderElement();
            });

          
            console.log("Shipment se inicio");

        },
        show: function () {
            this._super();
            let self = this;
            this.$('.sender').val('');
            this.$('.sent_note').val('');
            this.$('.sent_note').focus();

            this.pos.bind('sync:order_sent', function () {
                console.log("sync:order_sent: Send Screen");
                self.show_orders();
            });

        },
        show_orders: function () {

            this.get_orders_sent().then((orders) => {
                console.log(orders);
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
                self.gui.show_screen('products');
            });

            this.$('.next').click(function () {
                self.send_order();
            });

            this.show_orders();
        },

        order_select: function (event, $order, id) {
            var order = this.pos.db.shipment_order_by_id[id];
            this.$('.client-line').removeClass('highlight');
            $order.addClass('highlight');
            this.display_pos_order_detail(order);
            this.order_selected = order;
        },
        render_shipment_order_list: function (orders) {

            var contents = this.$el[0].querySelector('.pos_order_list');
            contents.innerHTML = "";
            let count_orders = orders.length;
            for (var i = 0, len = Math.min(count_orders, 1000); i < len; i++) {
                let order = orders[i];
                var pos_order_row = this.pos_order_cache.get_node(order.id);
                if (!pos_order_row) {
                    var pos_order_row_html = qweb.render('pos_order_row', {
                        widget: this,
                        order: order
                    });
                    var pos_order_row = document.createElement('tbody');
                    pos_order_row.innerHTML = pos_order_row_html;
                    pos_order_row = pos_order_row.childNodes[1];
                    this.pos_order_cache.cache_node(order.id, pos_order_row);
                }
                if (order === this.order_selected) {
                    pos_order_row.classList.add('highlight');
                } else {
                    pos_order_row.classList.remove('highlight');
                }
                contents.appendChild(pos_order_row);
            }


        },
        hide_order_selected: function () { // hide when re-print receipt
            var contents = this.$('.pos_detail');
            contents.empty();
            this.order_selected = null;

        },
        display_pos_order_detail: function (order) {
            var contents = this.$('.pos_detail');
            contents.empty();
            var self = this;
            this.order_selected = order;
            if (!order) {
                return;
            }
            order['link'] = window.location.origin + "/web#id=" + order.id + "&view_type=form&model=pos.order";
            contents.append($(qweb.render('pos_order_detail', {
                widget: this,
                order: order
            })));
            var lines = this.pos.db.shipment_lines_by_order_id[order['id']];
            if (lines) {
                var line_contents = this.$('.lines_detail');
                line_contents.empty();
                line_contents.append($(qweb.render('pos_order_lines', {
                    widget: this,
                    lines: lines
                })));
            };
            this.$('.return_order').click(function () {
                var order = self.order_selected;
                var order_lines = self.pos.db.shipment_lines_by_order_id[order.id];
                if (!order_lines) {
                    return self.gui.show_popup('confirm', {
                        title: 'Warning',
                        body: 'Order empty lines',
                    });
                } else {
                    return self.gui.show_popup('popup_return_pos_order_lines', {
                        order_lines: order_lines,
                        order: order
                    });
                }
            });
            this.$('.register_amount').click(function () {
                var pos_order = self.order_selected;
                if (pos_order) {
                    self.gui.show_popup('popup_register_payment', {
                        pos_order: pos_order
                    })
                }
            });
            this.$('.create_invoice').click(function () {
                var pos_order = self.order_selected;
                if (pos_order) {
                    return self.gui.show_popup('confirm', {
                        title: 'Create invoice ?',
                        body: 'Are you want create invoice for ' + pos_order['name'] + ' ?',
                        confirm: function () {
                            self.pos.gui.close_popup();
                            return rpc.query({
                                model: 'pos.order',
                                method: 'made_invoice',
                                args: [
                                    [pos_order['id']]
                                ],
                                context: {
                                    pos: true
                                }
                            }).then(function (invoice_vals) {
                                self.link = window.location.origin + "/web#id=" + invoice_vals[0]['id'] + "&view_type=form&model=account.invoice";
                                return self.gui.show_popup('confirm', {
                                    title: 'Are you want open invoice?',
                                    body: 'Invoice created',
                                    confirmButtonText: 'Yes',
                                    cancelButtonText: 'Close',
                                    confirm: function () {
                                        window.open(self.link, '_blank');
                                    },
                                    cancel: function () {
                                        self.pos.gui.close_popup();
                                    }
                                });
                            }).fail(function (type, error) {
                                return self.pos.query_backend_fail(type, error);
                            });
                        },
                        cancel: function () {
                            return self.pos.gui.close_popup();
                        }
                    });
                }
            });
            this.$('.reprint_order').click(function () {
                var order = self.order_selected;
                if (!order) {
                    return;
                }
                var date = null;
                if ([11, 12].indexOf(self.pos.server_version) != -1) {
                    date = self.pos.format_date(order['date_order'])
                }
                var json = {
                    'date': date,
                    'sequence_number': order['sequence_number'],
                    'name': order.name,
                    'partner_id': null,
                    'lines': [],
                    'amount_total': order.amount_total,
                    'uid': order['uid'],
                    'statement_ids': [],
                    'id': order.id,
                    'ean13': order.ean13
                };
                if (order.partner_id) {
                    json['partner_id'] = order.partner_id[0];
                }
                if (order.invoice_id) {
                    json['invoice_number'] = order.invoice_id[1].split(" ")[0];
                    json['invoice_id'] = order.invoice_id;
                }
                if (order.fiscal_position_id) {
                    json['fiscal_position_id'] = order.fiscal_position_id[0];
                }
                if (order.note) {
                    json['note'] = order.note;
                }
                var lines = self.pos.db.shipment_lines_by_order_id[order.id];
                if (lines) {
                    for (var i in lines) {
                        var line = lines[i];
                        json['lines'].push([0, 0, {
                            'price_unit': line.price_unit,
                            'qty': line.qty,
                            'product_id': line.product_id[0],
                            'discount': line.discount,
                            'pack_lot_ids': [],
                            'id': line.id
                        }])
                    }
                } else {
                    var lines = self.pos.db.shipment_lines_by_order_id[order['id']];
                    for (var i = 0; i < lines.length; i++) {
                        lines[i][2].qty = -lines[i][2].qty
                    }
                    json.lines = order.lines;
                }
                if (order) {
                    var order_temporary = new models.Order({}, {
                        pos: self.pos,
                        json: json,
                        temporary: true
                    });
                    if (json['invoice_number']) {
                        order_temporary['invoice_number'] = json['invoice_number'];
                    }
                    if (json['invoice_id']) {
                        order_temporary['invoice_id'] = json['invoice_id'];
                    }
                    var orders = self.pos.get('orders');
                    orders.add(order_temporary);
                    self.pos.set('selectedOrder', order_temporary);
                    self.pos.gui.show_screen('receipt');
                    self.hide_order_selected();
                }
            });
            this.$('.action_pos_order_cancel').click(function () {
                var order = self.order_selected;
                self.pos.gui.show_popup('confirm', {
                    title: 'Warning',
                    body: 'Are you sure cancel order ' + order['name'] + ' ?',
                    confirm: function () {
                        return rpc.query({
                            model: 'pos.order',
                            method: 'action_pos_order_cancel',
                            args: [
                                [self.order_selected['id']]
                            ],
                            context: {
                                pos: true
                            }
                        }).then(function () {
                            self.display_pos_order_detail(null);
                            self.pos.gui.show_popup('confirm', {
                                title: 'Done',
                                body: 'Order just processed to cancel'
                            });
                            var orders = _.filter(self.pos.db.shipment_orders_store, function (order) {
                                return order['state'] != 'paid' && order['state'] != 'done' && order['state'] != 'invoiced' && order['state'] != 'cancel'
                            });
                            self.render_shipment_order_list(orders);
                            return self.pos.gui.close_popup();
                        }).fail(function (type, error) {
                            return self.pos.query_backend_fail(type, error);
                        })
                    },
                    cancel: function () {
                        return self.pos.gui.close_popup();
                    }
                })
            })
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


            //self.pos.db.save_data_sync_sent_order(order);

            //self.pos.db.save_shipment_order(order);
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
        get_orders_sent: function () {
            return this._rpc({
                route: '/pos/get_orders_sent'
            });
        }

    });

    gui.define_screen({
        name: 'send_orders_screen',
        widget: send_orders_screen
    });


});