# -*- coding: utf-8 -*-
from odoo import api, fields, models, _


class pos_config(models.Model):
    _inherit = "pos.config"


    send_pos_orders = fields.Boolean('Send pos orders', default=0)
    search_pos_orders = fields.Boolean('Search pos orders sent', default=0)
    prohibit_payment = fields.Boolean('Prohibit payment', default=0)
    # sync_action_automatic = fields.Boolean('Sync order automatic', default=0,
    #                                     help = "The actions performed by the user, is automatically \
    #                                     displayed at the point of sale to other users")