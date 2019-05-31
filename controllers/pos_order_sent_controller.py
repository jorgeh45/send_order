from odoo import http
import json
import pprint

class PosOrderSent(http.Controller):

    @http.route('/pos/get_orders_sent', auth='user', type='json', cors="*")
    def get_orders_sent(self, **args):
        sent_orders= [] 
        pos_order_sent_obj = http.request.env['pos.order.sent'].sudo()
        orders = pos_order_sent_obj.search_read([],['id','uid_order','order_data'])

        for order in orders:
            sent_orders.append({
                'id': order['id'],
                'uid': order['uid_order'],
                'data': json.loads(order['order_data'])
            })
        return  sent_orders

    @http.route('/pos/send_order', auth='user', type='json', cors="*")
    def create_order_sent(self, **args):
        vals = args.get('data', False)
        if vals:
            pos_order_sent_obj = http.request.env['pos.order.sent'].sudo()
            pos_order_sent_obj.create(vals)

        return json.dumps({
            'status': 'OK',
            'code': 200
        })
    
    @http.route('/pos/delete_order_sent', auth='user', type='json', cors="*")
    def delete_order_sent(self, **args):
        uid = args.get('uid', False)
        if uid:
            pos_order_sent_obj = http.request.env['pos.order.sent'].sudo()
            order = pos_order_sent_obj.search([('uid_order','=',uid)])
            order.unlink()

        return json.dumps({
            'status': 'OK',
            'code': 200
        })