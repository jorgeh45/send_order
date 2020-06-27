from odoo import http
import json
import pprint


class PosOrderSent(http.Controller):

    @http.route('/pos/get_orders_sent', auth='user', type='json', cors="*")
    def get_orders_sent(self, **args):
        bus_id = args.get('bus_id', False)
        if not bus_id:
            return []
        sent_orders = []
        pos_order_sent_obj = http.request.env['pos.order.sent'].sudo()

        orders = pos_order_sent_obj.search_read(
            [('bus_id', '=', bus_id)], ['id', 'uid_order', 'order_data'])
        # import ipdb; ipdb.set_trace()
        for order in orders:
            sent_orders.append({
                'id': order['id'],
                'uid': order['uid_order'],
                'data': json.loads(order['order_data'])
            })
        return sent_orders
        
    @http.route('/pos/get_orders_sent_by_pos', auth='user', type='json', cors="*")
    def get_orders_sent_by_pos(self, **args):
        pos_config_id = args.get('pos_config_id', False)
        if not pos_config_id:
            return []
        sent_orders = []
        pos_order_sent_obj = http.request.env['pos.order.sent'].sudo()

        orders = pos_order_sent_obj.search_read(
            [('pos_config_id', '=', pos_config_id)], ['id', 'uid_order', 'order_data'])
        # import ipdb; ipdb.set_trace()
        for order in orders:
            sent_orders.append({
                'id': order['id'],
                'uid': order['uid_order'],
                'data': json.loads(order['order_data'])
            })
        return sent_orders


    @http.route('/pos/send_order', auth='public', type='json', cors="*")
    def create_order_sent(self, **args):
        vals = args.get('data', False)

        try:
               
            if vals:
                pp = pprint.PrettyPrinter(indent=4)
                pp.pprint(vals)
                pos_order_sent_obj = http.request.env['pos.order.sent'].sudo()
                pos_order_sent_obj.create(vals)

            return json.dumps({
                'status': 'OK',
                'code': 200
            })
                

        except:
            return json.dumps({
            'status': 'ERROR',
            'code': 400
        })

    @http.route('/pos/delete_order_sent', auth='user', type='json', cors="*")
    def delete_order_sent(self, **args):
        uid = args.get('uid', False)

        try:

            if uid:
                pos_order_sent_obj = http.request.env['pos.order.sent'].sudo()
                order = pos_order_sent_obj.search([('uid_order', '=', uid)])
                order.unlink()

            return json.dumps({
                'status': 'OK',
                'code': 200
            })

        except:
            return json.dumps({
            'status': 'ERROR',
            'code': 400
        })