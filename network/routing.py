from django.urls import re_path, path

from . import consumers

websocket_urlpatterns = [    
    re_path(r'ws/chat/(?P<user_1_id>\w+)/(?P<user_2_id>\w+)/$', consumers.ChatConsumer.as_asgi()),   
]