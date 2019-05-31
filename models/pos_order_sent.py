# -*- coding: utf-8 -*-
from odoo import api, fields, models

class PosOrderSent(models.Model):
    _name = "pos.order.sent"
    _description = "Management orders sent to another user of the pos"

    
    uid_order = fields.Char(
        string=u'uid_order',
    )
    
    order_data = fields.Text(
        string=u'Order data',
    )


    def get_order_sent(self, uid):
        res = {}
        order = self.search(['uid_order', '=', uid])
        if order:
           res = {'uid' :order.uid_order,
                'data' : order.data }

        return res
    
