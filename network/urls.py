from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.loginView, name="login"),
    path("logout", views.logoutView, name="logout"),
    path("register", views.register, name="register"),
    
    # GET API route
    path("get_posts/<str:post_type>/<int:page_number>", views.getPosts, name="get_posts"),
    path("get_posts/<str:post_type>/<int:page_number>/<int:user_id>", views.getPosts, name="get_user_posts"),
    path("get_user/<int:user_id>", views.getUser, name="get_user"),
    path("search_query/<str:query>/<int:page_number>", views.searchQuery, name="search_query"),
    path("message_chat_info/<int:user_id>/<int:request_user_id>", views.messageChatInfo, name="message_chat_info"),
    
    # PUT API route
    path("edit_post", views.editPost, name="edit_post"),
    path("edit_user_image_fetch", views.editUserImageFetch, name="edit_user_image_fetch"),
    
    # POST API route
    path("delete_post/<int:post_id>", views.deletePost, name="delete_post"),
    path("create_post", views.createPost, name="create_post"),
    path("create_comment", views.createComment, name="create_comment"),
    path("toggle_friend_request/<int:requestor_id>/<int:requested_id>", views.toggleFriendRequest, name="create_friend_request"),
    path("friend_request_reply", views.friendRequestReply, name="friend_request_reply"),
    path("unfriend_request", views.unfriendRequest, name="unfriend_request"),
]
