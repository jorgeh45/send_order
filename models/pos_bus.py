# -*- coding: utf-8 -*-
from odoo import api, models, fields, registry
import json
import logging

_logger = logging.getLogger(__name__)

class pos_bus(models.Model):
    _name = "pos.bus"
    _description = "Branch/Store of shops"

    name = fields.Char('Nombre', required=1)

    from_remote_server = fields.Boolean(string='Sucursal Remota')

    remote_user  = fields.Char('User')
    remote_password  = fields.Char('Password')
    remote_server  = fields.Char('Server')
    remote_db  = fields.Char('Database')


    
    # user_id = fields.Many2one('res.users', string='Sale admin')
    # log_ids = fields.One2many('pos.bus.log', 'bus_id', string='Logs')

class pos_bus_log(models.Model):
    _name = "pos.bus.log"
    _description = "Transactions of Branch/Store"

    user_id = fields.Many2one('res.users', 'Send from', required=1, ondelete='cascade', index=True)
    bus_id = fields.Many2one('pos.bus', 'Branch/Store', required=1, ondelete='cascade', index=True)
    action = fields.Selection([
        ('selected_order', 'Change order'),
        ('new_order', 'Add order'),
        ('unlink_order', 'Remove order'),
        ('line_removing', 'Remove line'),
        ('set_client', 'Set customer'),
        ('trigger_update_line', 'Update line'),
        ('change_pricelist', 'Add pricelist'),
        ('sync_sequence_number', 'Sync sequence order'),
        ('lock_order', 'Lock order'),
        ('unlock_order', 'Unlock order'),
        ('set_line_note', 'Set note'),
        ('set_state', 'Set state'),
        ('order_transfer_new_table', 'Transfer to new table'),
        ('set_customer_count', 'Set guest'),
        ('request_printer', 'Request printer'),
        ('set_note', 'Set note'),
        ('paid_order', 'Paid order'),
        ('sent_order', 'Sent order')
    ], string='Action', required=1, index=True)


