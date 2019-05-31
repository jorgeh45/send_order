# -*- coding: utf-8 -*-
from odoo import api, fields, models, _


class pos_config(models.Model):
    _inherit = "pos.config"


    send_pos_orders = fields.Boolean('Send pos orders', default=0)
    search_pos_orders = fields.Boolean('Search pos orders sent', default=0)
    prohibit_payment = fields.Boolean('Prohibit payment', default=0)

    sync_multi_session = fields.Boolean('Sync multi session', default=1)
    bus_id = fields.Many2one('pos.bus', string='Branch/store',
    default= lambda self: self.env.ref('send_order.pos_bus_store_default'))