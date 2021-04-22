
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    # GET API route
    path("get_posts/<str:post_type>/<int:page_number>", views.get_posts, name="get_posts"),
    path("get_posts/<str:post_type>/<int:page_number>/<int:user_id>", views.get_posts, name="get_user_posts"),
    path("get_user/<int:user_id>", views.get_user, name="get_user"),
    path("search_query/<str:query>/<int:page_number>", views.search_query, name="search_query"),
    path("message_chat_info/<int:user_id>/<int:request_user_id>", views.message_chat_info, name="message_chat_info"),
    
    # PUT API route
    path("edit_post", views.edit_post, name="edit_post"),
    path("edit_user_image_fetch", views.edit_user_image_fetch, name="edit_user_image_fetch"),
    
    # POST API route
    path("delete_post/<int:post_id>", views.delete_post, name="delete_post"),
    path("create_post", views.create_post, name="create_post"),
    path("create_comment", views.create_comment, name="create_comment"),
    path("toggle_friend_request/<int:requestor_id>/<int:requested_id>", views.toggle_friend_request, name="create_friend_request"),
    path("friend_request_reply", views.friend_request_reply, name="friend_request_reply"),
    path("unfriend_request", views.unfriend_request, name="unfriend_request"),
    path("send_message/<int:sender_id>/<int:receiver_id>", views.send_message, name="send_message"),
]
