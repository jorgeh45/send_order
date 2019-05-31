{
    'name': "Send Order in the POS",
    'version': '1.0',
    'category': 'Point of Sale',
    'author': 'Jorge Miguel Hernandez Santos (dev.jhernandez@gmail.com)',
    'sequence': 30,
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'security/ir.model.access.csv',
        'datas/pos_bus.xml',
        'views/pos_config.xml',
        'views/pos_order_sent.xml',
        'views/template.xml'
    ],
    'qweb': [
        'static/src/xml/screen_shipment_orders.xml',
        'static/src/xml/buttons.xml',
        
    ],
    'installable': True,
    'application': True,
    'images': ['static/description/icon.png'],
    'support': 'dev.jhernandez@gmail.com',
    'license': 'OPL-1',
}
