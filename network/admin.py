from django.contrib import admin
from .models import *
from django.contrib.auth.admin import UserAdmin

# Register your models here.

class UserCustomAdmin(admin.ModelAdmin):
    filter_horizontal = ('follow',)

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'content', 'poster')
    
class CommentAdmin(admin.ModelAdmin):
    list_display = ('content', 'commentor')
    
class LikeAdmin(admin.ModelAdmin):
    list_display = ('liker', 'post')
    
class ChatBoxAdmin(admin.ModelAdmin):
    list_display = ('id',)
    
class MessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'chatbox')

admin.site.register(User, UserCustomAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Like, LikeAdmin)
admin.site.register(ChatBox, ChatBoxAdmin)
admin.site.register(Message, MessageAdmin)  