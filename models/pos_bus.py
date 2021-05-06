# -*- coding: utf-8 -*-


from odoo import api, models, fields, registry
from odoo.exceptions import UserError
import json
import logging

try:
    from xmlrpc import client as xmlrpclib
except ImportError:
    import xmlrpclib

_logger = logging.getLogger(__name__)

class pos_bus(models.Model):
    _name = "pos.bus"
    _description = "Branch/Store of shops"

    name = fields.Char('Nombre', required=1)

    from_remote_server = fields.Boolean(string='Sucursal Remota')

    remote_user  = fields.Char('User')
    remote_password  = fields.Char('Password')
    remote_server  = fields.Char('Server')
    remote_port  = fields.Char('Port', default=8069)
    remote_db  = fields.Char('Database')


    def test_connection(self):

        HOST = self.remote_server
        PORT = int(self.remote_port) 
        DB = self.remote_db
        USER = self.remote_user
        PASS = self.remote_password

        con = False

        try:
            url = 'http://%s:%d/xmlrpc/'%(HOST,PORT)
            object_proxy = xmlrpclib.ServerProxy(url+'object')
            common_proxy = xmlrpclib.ServerProxy(url+'common')

            uid = common_proxy.login(DB,USER,PASS)
            print("") 
            print("Login %s (uid:%d)"%(USER,uid)) 
            print("") 
            con = True
        except:
            raise UserError("Error tratando de conectar con el servidor, por favor verificar los datos")

        if con:
            raise UserError("Conexion exitosa!")
        
    def test_server(self):

        if self.from_remote_server:
            self.test_connection()


    def get_pos_config_from_another_server(self):

        try:
            # commands  = 'pos.config', 'search_read', [[['active', '=', True]]],  {'fields': ['id', 'name']}

            records = self.execute_command('pos.config', 'search_read', [['active', '=', True]], ['id', 'name']);

            return json.dumps({
                'status': 'OK',
                'code': 200,
                'data': records
            })
          
        except:
            raise UserError("Error tratando de conectar con el servidor, por favor verificar los datos")
    
    def create_order_in_another_server(self,values):

        vals = values.get('data', False)
        # commands  = 'pos.order.sent', 'create', vals

        try:

            records =  self.execute_command('pos.order.sent', 'create', vals);

            return json.dumps({
                'status': 'OK',
                'code': 200,
                'data': records
            })
          
        except:
            raise UserError("Error tratando de conectar con el servidor, por favor verificar los datos")

    def execute_command(self,*args):

        HOST = self.remote_server
        PORT = int(self.remote_port) 
        DB = self.remote_db
        USER = self.remote_user
        PASS = self.remote_password
        
        try:
            url = 'http://%s:%d/xmlrpc/'%(HOST,PORT)
            object_proxy = xmlrpclib.ServerProxy(url+'object')
            common_proxy = xmlrpclib.ServerProxy(url+'common')

            uid = common_proxy.login(DB,USER,PASS)
            records = object_proxy.execute(DB, uid, PASS, *args)
            return records

        except:
            raise UserError("Error tratando de conectar con el servidor, por favor verificar los datos")



    
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


