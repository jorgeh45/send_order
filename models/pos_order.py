# -*- coding: utf-8 -*-
from odoo import api, fields, models

class PosOrder(models.Model):

    
    _inherit = ['pos.order']
    
    @api.model
    def wk_print_picking_report(self):
        report_ids = self.env['ir.actions.report.xml'].sudo().search(
            [('model', '=', 'stock.picking'), ('report_name', '=', 'stock.report_deliveryslip')])
        return report_ids and report_ids[0].id or False
    