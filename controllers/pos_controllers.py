# -*- coding: utf-8 -*
from odoo.http import request
from odoo.addons.bus.controllers.main import BusController
from odoo import api, http, SUPERUSER_ID
import json
import werkzeug.utils

class pos_bus(BusController):

    def _poll(self, dbname, channels, last, options):
        channels = list(channels)
        channels.append((request.db, 'pos.sync.stock', request.uid))
        channels.append((request.db, 'pos.sync.data', request.uid))
        channels.append((request.db, 'pos.bus', request.uid))
        return super(pos_bus, self)._poll(dbname, channels, last, options)


    @http.route('/pos/sync', type="json", auth="public")
    def send(self, bus_id, messages):
        for message in messages:
            if not message.get('value', None) or not message['value'].get('order_uid', None) or not message[
                'value'].get('action', None):
                continue
            user_send_id = message['user_send_id']
            send = 0
            sessions = request.env['pos.session'].sudo().search([
                ('state', '=', 'opened'),
                ('user_id', '!=', user_send_id)
            ])
            for session in sessions:
                if session.config_id.bus_id and session.config_id.bus_id.id == bus_id and user_send_id != session.user_id.id:
                    send += 1
                    request.env['bus.bus'].sendmany(
                        [[(request.env.cr.dbname, 'pos.bus', session.user_id.id), json.dumps(message)]])
        return json.dumps({
            'status': 'OK',
            'code': 200
        })
