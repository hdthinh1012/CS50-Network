from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    follow = models.ManyToManyField("User", blank=True, related_name="followers")
    image = models.ImageField(upload_to='image/user/%Y/%m/%d', default="default.png")
    friends = models.ManyToManyField("User", blank=True)
    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'follow': [follow.username for follow in self.follow.all()],
            'followers':[follower.username for follower in self.followers.all()],
            'posts': [post.serialize() for post in self.posts.order_by("-timestamp").all()],
            'image_url': self.image.url,
            'friends': [{"username" :friend.username, "id": friend.id} for friend in self.friends.all()],
            'friend_request_received': [request.serialize() for request in self.friend_request_received.all()],
        }


class Post(models.Model):
    poster = models.ForeignKey('User', on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=50)
    content = models.TextField(max_length=200)
    timestamp = models.DateTimeField(blank=True, null=True)
    image = models.ImageField(upload_to='image/post/%Y/%m/%d', default="default.png")
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'poster_id': self.poster.id,
            'content': self.content,
            'poster': self.poster.username,   
            'comments': [comment.serialize() for comment in self.comments.order_by("-timestamp").all()],
            'timestamp': self.timestamp.strftime('%B %d %Y, %H:%M %p'),
            'likes': [like.serialize() for like in self.likes.all()],
            'image_url': self.image.url,
            'poster_image_url': self.poster.image.url,
        }        
        
        
class Comment(models.Model):
    commentor = models.ForeignKey('User', on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey('Post', on_delete=models.CASCADE, null=True, blank=True, related_name="comments")
    content = models.TextField(max_length=200)
    timestamp = models.DateTimeField(blank=True, null=True)
    def serialize(self):
        return {
            'id': self.id,
            'commentor': self.commentor.username,
            'commentor_id': self.commentor.id,
            'content': self.content,
            'timestamp': self.timestamp.strftime('%B %d %Y, at %H:%M %p')
        }      
        
                                 
class Like(models.Model):
    liker = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="likes")
    def serialize(self):
        return {
            'id': self.id,
            'liker': self.liker.username,
        }


class FriendRequest(models.Model):
    requestor = models.ForeignKey('User', on_delete=models.CASCADE, related_name="friend_request_sent")   
    requested = models.ForeignKey('User', on_delete=models.CASCADE, related_name="friend_request_received")
    def serialize(self):
        return {
            'requestor': self.requestor.username,
            'requested': self.requested.username,
            'requestor_id': self.requestor.id,
            'requested_id': self.requested.id,
        }
        

class ChatBox(models.Model):
    users = models.ManyToManyField('User', related_name="chat_boxes")
    def serialize(self):
        return {
            'users': [user.serialize() for user in self.users.all()],
            'messages': [message.serialize() for message in self.all_messages.order_by("-timestamp").all()[:6]],
        }
    
    
class Message(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name="all_messages_sent")
    content = models.CharField(max_length=30)
    chatbox = models.ForeignKey('ChatBox', on_delete=models.CASCADE, related_name="all_messages")
    timestamp = models.DateTimeField(blank=True, null=True)
    def serialize(self):
        return {
            'user': self.user.username,
            'user_id': self.user.id,
            'content': self.content,
            'timestamp': self.timestamp.strftime('%B %d %Y, at %H:%M %p'),
        }