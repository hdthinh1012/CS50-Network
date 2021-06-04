# from .models import *
# from django.db.models.signals import post_save 
# from django.core.signals import request_finished
# from django.dispatch import receiver
# from .views import *

# @receiver(post_save, sender=Message)
# def updateMessageUI(sender, instance, created, **kwargs):
#     if created:
#         print('''
#         Signals trigger database command only, cannot trigger asynchronous
#         function need request method, using Django Channel instead
#         ''')
 