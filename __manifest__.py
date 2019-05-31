{
    'name': "Send Order in the POS",
    'version': '1.0',
    'category': 'Point of Sale',
    'author': 'Jorge Miguel Hernandez Santos (dev.jhernandez@gmail.com)',
    'sequence': 5,
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_config.xml',
        'views/pos_order_sent.xml',
        'views/template.xml'
    ],
    'qweb': [
        'static/src/xml/screen_shipment_orders.xml'
    ],
    'installable': True,
    'images': ['static/description/send_order_logo.png'],
    'support': 'dev.jhernandez@gmail.com',
    'license': 'OPL-1',
}
