from django.apps import AppConfig

class NetworkConfig(AppConfig):
    name = 'network'

class MessageConfig(AppConfig):
    name = 'network'
    def ready(self):
        import network.signals