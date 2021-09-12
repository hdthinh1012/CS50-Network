import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .views import *

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['user_1_id'] + self.scope['url_route']['kwargs']['user_2_id']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        sender_id = text_data_json['sender_id']
        receiver_id = text_data_json['receiver_id']
        content = text_data_json['content']

        users = User.objects.filter(id__in=[sender_id, receiver_id])
        sender = User.objects.get(pk=sender_id)
        receiver = User.objects.get(pk=receiver_id)
        user_list = [sender, receiver]
        chatbox = ChatBox.objects.all()
        for user in user_list:
            chatbox = chatbox.filter(users=user)
        chatbox = chatbox.first()
        timestamp = datetime.datetime.now()
        message = Message(user=sender, chatbox=chatbox, content=content, timestamp=timestamp)
        message.save()
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                **message.serialize(),
                'type': 'chatMessage'
            }
        )

    # Receive message from room group
    def chatMessage(self, chat_info):
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'chat_info': chat_info,
        }))