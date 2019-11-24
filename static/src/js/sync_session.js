odoo.define('send_order.synchronization', function (require) {
    var models = require('point_of_sale.models');
    var rpc = require('pos.rpc');
    var exports = {}
    var Backbone = window.Backbone;
    var bus = require('pos.bus');
    var core = require('web.core');
    var _t = core._t;
    var session = require('web.session');
    var screens = require('point_of_sale.screens');
    var db = require('point_of_sale.DB');

    db.include({
        // save data send fail of sync
        add_datas_false: function (data) {
            var datas_false = this.load('datas_false', []);
            this.sequence += 1
            data['sequence'] = this.sequence
            datas_false.push(data);
            this.save('datas_false', datas_false);
        },

        get_datas_false: function () {
            var datas_false = this.load('datas_false');
            if (datas_false && datas_false.length) {
                return datas_false
            } else {
                return []
            }
        },
        remove_data_false: function (sequence) {
            var datas_false = this.load('datas_false', []);
            var datas_false_new = _.filter(datas_false, function (data) {
                return data['sequence'] !== sequence;
            });
            this.save('datas_false', datas_false_new);
        }
    });


    exports.pos_bus = Backbone.Model.extend({
        initialize: function (pos) {
            var self = this;
            this.pos = pos;
            this.stop = false;
            setInterval(function () {
                self.repush_to_another_sessions();
            }, 15000);
        },
        push_message_to_other_sessions: function (value) {
            if (this.pos.the_first_load || this.pos.the_first_load == undefined || !this.pos.config.bus_id) { // when cashier come back pos screen (reload browse) no need sync data
                return;
            }
            var self = this;
            if (!value['order_uid']) {
                return;
            }
            var message = {
                user_send_id: this.pos.user.id,
                value: value,
            };
            var params = {
                bus_id: self.pos.config.bus_id[0],
                messages: [message],
            };
            var sending = function () {
                return session.rpc("/pos/sync", params);
            };
            return sending().fail(function (error, e) {
                console.error(error.message);
                if (error.message == "XmlHttpRequestError ") {
                    self.pos.db.add_datas_false(message);
                }
            }).done(function () {
                self.pos.trigger('reload:kitchen_screen');
            })
        },
        get_message_from_other_sessions: function (messages) {
            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                if (!message || message.length < 2) {
                    continue;
                }
                var channel = message[0][1];
                if (message[0] && channel && channel == 'pos.bus') {
                    var message = JSON.parse(message[1]);
                    this.pos.syncing_sessions(message['value']);
                }
            }
        },
        start: function () {
            this.bus = bus.bus;
            this.bus.last = this.pos.db.load('bus_last', 0);
            this.bus.on("notification", this, this.get_message_from_other_sessions);
            this.bus.start_polling();
        },
        repush_to_another_sessions: function () {
            var self = this;
            if (!self.pos.config.bus_id) {
                return;
            }
            var datas_false = this.pos.db.get_datas_false();
            if (datas_false && datas_false.length) {
                console.log('repush_to_another_sessions');
                var sending = function () {
                    return session.rpc("/pos/sync", {
                        bus_id: self.pos.config.bus_id[0],
                        messages: datas_false
                    });
                };
                sending().fail(function () {
                    console.error('No internet');
                    self.pos.gui.show_popup('notify_popup', {
                        title: 'Warning',
                        from: 'top',
                        align: 'center',
                        body: 'Your internet have problem or Odoo Server offline mode. Please contact cashier admin if have any order, update lines',
                        color: 'danger',
                        timer: 1000
                    });
                }).done(function () {
                    for (var i = 0; i < datas_false.length; i++) {
                        self.pos.db.remove_data_false(datas_false[i]['sequence']);
                    }
                    self.pos.gui.show_popup('notify_popup', {
                        title: 'ALERT',
                        from: 'top',
                        align: 'center',
                        body: 'Odoo online mode, you can do anything. Thanks for wait',
                        color: 'success',
                        timer: 1000
                    });
                })
            }
        }
    });
    var _super_PosModel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        isEmpty: function (obj) {
            return Object.keys(obj).length === 0;
        },

        load_orders: function () {
            this.the_first_load = true;
            _super_PosModel.load_orders.apply(this, arguments);
            this.the_first_load = false;
        },
        syncing_sessions: function (message) {
            let action = message['action'];
            if (action == 'sent_order') {
                this.trigger('sync:order_sent')
            }

        },
        load_server_data: function () {
            var self = this;
            return _super_PosModel.load_server_data.apply(this, arguments).then(function () {
                if (self.config.bus_id) {
                    if (self.config.send_pos_orders || self.config.search_pos_orders) {
                        self.chrome.loading_message(_t('Active sync between sessions'), 1);
                        self.pos_bus = new exports.pos_bus(self);
                        self.pos_bus.start();
                        // console.log('Actived sync between sessions')
                    }
                }
            })
        },
        session_info: function () {
            var user;
            if (this.get('cashier')) {
                user = this.get('cashier');
            } else {
                user = this.user;
            }
            return {
                'bus_id': this.config.bus_id[0],
                'user': {
                    'id': user.id,
                    'name': user.name
                },
                'pos': {
                    'id': this.config.id,
                    'name': this.config.name
                },
                'date': new Date().toLocaleTimeString()
            }
        },
        get_session_info: function () {
            var order = this.get_order();
            if (order) {
                return order.get_session_info();
            }
            return null;
        }
    });

    return exports;
});