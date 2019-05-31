# -*- coding: utf-8 -*-
from odoo import api, models, fields, registry
import json
import logging

_logger = logging.getLogger(__name__)

class pos_bus(models.Model):
    _name = "pos.bus"
    _description = "Branch/Store of shops"

    name = fields.Char('Location Name', required=1)

    @api.model
    def sync_orders(self, config_id, datas):
        config = self.env['pos.config'].sudo().browse(config_id)
        sessions = self.env['pos.session'].sudo().search([
            ('state', '=', 'opened')
        ])
        for session in sessions:
            if session.config_id.user_id and session.config_id.user_id != self.env.user and session.config_id and session.config_id.bus_id and session.config_id.bus_id.id == config.bus_id.id:
                for data in datas:
                    value = {
                        'data': data,
                        'action': 'new_order',
                        'bus_id': config.bus_id.id,
                        'order_uid': data['uid']
                    }
                    _logger.info('Sync order to %s' % session.config_id.user_id.login)
                    self.env['bus.bus'].sendmany(
                        [[(self.env.cr.dbname, 'pos.bus', session.config_id.user_id.id), json.dumps({
                            'user_send_id': self.env.user.id,
                            'value': value
                        })]])





