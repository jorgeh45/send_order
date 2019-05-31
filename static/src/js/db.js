/*
    This module create by: dev.jhernandez@gmail.com
    License: OPL-1
    Please do not modification if i not accept
    Thanks for understand
 */
odoo.define('send_order.database', function (require) {
    var db = require('point_of_sale.DB');

    db.include({
        init: function (options) {
            this._super(options);
            //shipment orders
            this.shipment_order_by_id = {};
            this.shipment_orders_store = [];
            this.shipment_order_by_ean13 = {};
            this.shipment_order_search_string = "";
            this.shipment_order_line_by_id = {};
            this.shipment_pos_order_lines = [];
            this.shipment_lines_by_order_id = {};
        },

        _shipment_order_search_string: function (order) {
            var str = order.ean13;
            str += '|' + order.name;
            if (order.partner_id) {
                var partner = this.partner_by_id[order.partner_id.id]
                if (partner) {
                    if (partner['name']) {
                        str += '|' + partner['name'];
                    }
                    if (partner.mobile) {
                        str += '|' + partner['mobile'];
                    }
                    if (partner.phone) {
                        str += '|' + partner['phone'];
                    }
                    if (partner.email) {
                        str += '|' + partner['email'];
                    }
                }
            }

            str = '' + order['id'] + ':' + str.replace(':', '') + '\n';
            return str;
        },

        search_shipment_order: function (query) {
            try {
                query = query.replace(/[\[\]\(\)\+\*\?\.\-\!\&\^\$\|\~\_\{\}\:\,\\\/]/g, '.');
                query = query.replace(' ', '.+');
                var re = RegExp("([0-9]+):.*?" + query, "gi");
            } catch (e) {
                return [];
            }
            var results = [];
            for (var i = 0; i < this.limit; i++) {
                var r = re.exec(this.shipment_order_search_string);
                if (r && r[1]) {
                    var id = r[1];
                    if (this.shipment_order_by_id[id] !== undefined) {
                        results.push(this.shipment_order_by_id[id]);
                    }
                } else {
                    break;
                }
            }
            return results;
        },
        save_shipment_pos_orders: function (orders) { // stores shipment posorders
            if (this.shipment_orders_store.length == 0) {
                this.shipment_orders_store = orders;
            } else {
                this.shipment_orders_store = this.shipment_orders_store.concat(orders);
            }
            for (var i = 0; i < orders.length; i++) {
                var order = orders[i];
                if (order.partner_id) {
                    var partner;
                    if (order.partner_id && order.partner_id[0]) {
                        partner = this.get_partner_by_id(order.partner_id[0]);
                    } else {
                        partner = this.get_partner_by_id(order.partner_id);
                    }
                    if (partner) {
                        order.partner = partner;
                        order.partner_name = partner.name;
                    }
                }
                this.shipment_order_by_id[order['id']] = order;
                this.shipment_order_by_ean13[order.ean13] = order;
                var label = order['name']; // auto complete
                if (order['ean13']) {
                    label += ', ' + order['ean13']
                }
                if (order['pos_reference']) {
                    label += ', ' + order['pos_reference']
                }
                if (order.partner_id) {
                    var partner = this.get_partner_by_id(order.partner_id[0]);
                    if (partner) {
                        label += ', ' + partner['name'];
                        if (partner['email']) {
                            label += ', ' + partner['email']
                        }
                        if (partner['phone']) {
                            label += ', ' + partner['phone']
                        }
                        if (partner['mobile']) {
                            label += ', ' + partner['mobile']
                        }
                    }
                }
                this.shipment_order_search_string += this._shipment_order_search_string(order);
                this.pos_orders_autocomplete.push({
                    value: order['id'],
                    label: label
                })
            }
        },
        save_data_sync_sent_order: function (orders) { // send the order between the pos
            
            this.shipment_orders_store = orders;
            let count_orders = this.shipment_orders_store.length;

            for (let i = 0; i < count_orders; i++) {
                let new_order = this.shipment_orders_store[i];


                if (new_order.partner_id) {
                    var partner = this.get_partner_by_id(new_order.partner_id[0]);
                    new_order.partner = partner;
                }
                this.shipment_order_by_id[new_order['id']] = new_order;
                this.shipment_order_by_ean13[new_order.ean13] = new_order;

                this.shipment_orders_autocomplete = _.filter(this.shipment_orders_autocomplete, function (data) {
                    return data['value'] != new_order['uid'];
                });
                var label = new_order['name']; // auto complete
                if (new_order['ean13']) {
                    label += ', ' + new_order['ean13']
                }
                if (new_order['pos_reference']) {
                    label += ', ' + new_order['pos_reference']
                }

                if (new_order['sent_note']) {
                    label += ', ' + new_order['sent_note']
                }

                if (new_order['sender']) {
                    label += ', ' + new_order['sender']
                }
                if (new_order.partner_id) {
                    var partner = this.get_partner_by_id(new_order.partner_id[0]);
                    if (partner) {
                        label += ', ' + partner['name'];
                        if (partner['email']) {
                            label += ', ' + partner['email']
                        }
                        if (partner['phone']) {
                            label += ', ' + partner['phone']
                        }
                        if (partner['mobile']) {
                            label += ', ' + partner['mobile']
                        }
                    }
                }
                this.shipment_orders_autocomplete.push({
                    value: new_order['uid'],
                    label: label
                });
            }
            this.shipment_order_search_string = "";
            for (var i = 0; i < this.shipment_orders_store.length; i++) {
                var order = this.shipment_orders_store[i]
                this.shipment_order_search_string += this._shipment_order_search_string(order);
            }
        },
    });
});
