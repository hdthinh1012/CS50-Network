from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from django.views.generic import ListView
from django.core.paginator import Paginator
import datetime
from .models import *
from django import forms 
from django.db.models import Q


class UserImageForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['image']
        labels = {
            "image": "",
        }
        

class PostCreateForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'image']


@csrf_exempt
@login_required(login_url="login")
def editUserImage(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400) 
    else:
        user = User.objects.get(pk=request.user.id)
        form = UserImageForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
        else:
            raise Exception
    return render(request, "network/index.html",{
        'user_image_form': UserImageForm()
    })
    

@csrf_exempt
def searchQuery(request, query, page_number):
    users = User.objects.all()
    posts = Post.objects.all()
    queries = []
    for user in users:
        if query.lower() in user.username.lower():
            queries.append(user)
    for post in posts:
        if query.lower() in post.title.lower():
            queries.append(post)
    page_number = int(page_number)
    all_page = Paginator(queries, page_length)
    current_page = all_page.page(page_number).object_list
    return JsonResponse([*[q.serialize() for q in current_page], *[page_number], *[all_page.num_pages]], safe=False)

    
@csrf_exempt
@login_required(login_url="login")
def editUserImageFetch(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400) 
    else:
        user = User.objects.get(pk=request.user.id)
        form = UserImageForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
        else:
            return JsonResponse({"message": "Edit image failed"}, status=400)
    return JsonResponse({"message": "Edit image success"}, status=201)


@login_required(login_url="login")
def index(request):
    return render(request, "network/index.html",{
        'user_image_form': UserImageForm(),
        'weather_image_url': '/media/default.png',
    })


@csrf_exempt
@login_required(login_url="login")
def createPost(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)   
    timestamp = datetime.datetime.now()
    form = PostCreateForm(request.POST, request.FILES)
    if form.is_valid():
        title = form.cleaned_data["title"]
        content = form.cleaned_data["content"]
        image = form.cleaned_data["image"]
        post = Post(poster=request.user, title=title, content=content, image=image, timestamp=timestamp)
        post.save()
    else:
        return JsonResponse({"error": "Invalid Post Form"}, status=500)   
    return JsonResponse({'message': "Create post success."}, status=201)


@csrf_exempt
@login_required(login_url="login")
def deletePost(request, post_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400) 
    post = Post.objects.get(pk=post_id)
    post.delete()
    return JsonResponse({'message': "Delete post success."}, status=201)


@csrf_exempt
@login_required(login_url="login")
def editPost(request):
    if request.method == "POST":
        data = json.loads(request.body)
        post_id = data.get("id","")
        content = data.get("content","")
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not exist"}, status=400)
        post.content = content
        post.save()
        return JsonResponse({"message": "Update post success"}, status=201)
    elif request.method == "PUT":
        data = json.loads(request.body)
        liker_id = data.get("liker_id","")
        post_id = data.get("post_id","")
        react_type = data.get("type","")
        post = Post.objects.get(pk=post_id)
        liker = User.objects.get(pk=liker_id)
        if react_type == 'like':
            new_like = Like(post=post, liker=liker)
            new_like.save()
            return JsonResponse({"message": "Like success"}, status=201)
        elif react_type == 'unlike':
            like = Like.objects.get(liker=liker, post=post)
            like.delete()
            return JsonResponse({"message": "Unlike success"}, status=201)
    return JsonResponse({"error": "POST or PUT request required."}, status=400)
    

page_length = 2
@login_required(login_url="login")
def getPosts(request, post_type, page_number, user_id = ""):
    if post_type=="all-posts":
        posts = Post.objects.order_by("-timestamp").all()
    elif post_type=="follow-posts":
        posts = Post.objects.order_by("-timestamp").filter(poster__in=request.user.follow.all())
    elif post_type=="profile-posts":
        user = User.objects.get(pk=user_id)
        posts = Post.objects.order_by("-timestamp").filter(poster=user)
    else:
        return JsonResponse({"error": "Invalid posts type"}, status=400)
    page_number = int(page_number)
    all_page = Paginator(posts, page_length)
    current_page = all_page.page(page_number).object_list
    return JsonResponse([*[post.serialize() for post in current_page], *[page_number], *[all_page.num_pages]], safe=False)


@csrf_exempt
@login_required(login_url="login")
def getUser(request, user_id):
    if request.method == "GET":
        # Lower performance than try except with get()
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not exist"}, status=201)
        user_info = user.serialize()
        
        friendRequest = FriendRequest.objects.filter(requestor=request.user, requested=user).first()
        user_info['isFriendRequestSend'] = friendRequest != None
        return JsonResponse(user_info, safe=False)
    
    elif request.method == "PUT":
        data = json.loads(request.body)
        follower_id = int(data.get("follower_id",""))
        print(f'Print: {data.get("followed_id","")}')
        followed_id = int(data.get("followed_id",""))
        follower = User.objects.get(pk=follower_id)
        followed = User.objects.get(pk=followed_id)
        if data.get("follow") == "unfollow":
            follower.follow.remove(followed)
        else:
            follower.follow.add(followed)
        return JsonResponse({"message": "Toggle follow success"}, status=201)
    
    else:
        return JsonResponse({"error": "GET/PUT required"}, status=400)


@csrf_exempt
@login_required(login_url="login") 
def createComment(request):
    if request.method != "POST":
        return JsonResponse({"error": "Must be POST request"}, status=400)
    data = json.loads(request.body)
    content = data.get("content","")
    post_id = data.get("post_id","")
    post = Post.objects.get(pk=post_id)
    timestamp = datetime.datetime.now()
    comment = Comment(commentor=request.user, post=post, content=content, timestamp=timestamp)
    comment.save()
    return JsonResponse({"message": "Create comment success"}, status=201) 


@csrf_exempt
@login_required(login_url="login")
def toggleFriendRequest(request, requestor_id, requested_id):
    if request.method != "PUT":
        return JsonResponse({"error": "Must be PUT request"}, status=400)
    data = json.loads(request.body)
    isFriendRequestSend = data.get("isFriendRequestSend","")
    requestor = User.objects.get(pk=requestor_id)
    requested = User.objects.get(pk=requested_id)
    if isFriendRequestSend:
        friend_request = FriendRequest.objects.get(requestor=requestor, requested=requested)
        friend_request.delete()
    else:
        new_friend_request = FriendRequest(requestor=requestor, requested=requested)
        new_friend_request.save() 
    return JsonResponse({"message": "Toggle friend request success"}, status=201)


@csrf_exempt
@login_required(login_url="login")
def friendRequestReply(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)
    data = json.loads(request.body)
    requestor_id = data.get("requestor_id", "")
    requested_id = data.get("replier_id","")
    requestor = User.objects.get(pk=requestor_id)
    requested = User.objects.get(pk=requested_id)
    is_accept = data.get("is_accept","")
    if is_accept:
        requestor.friends.add(requested)
        requested.friends.add(requestor)
        chatbox = ChatBox()
        chatbox.save()
        chatbox.users.add(requested)
        chatbox.users.add(requestor)
    friendRequest = FriendRequest.objects.filter(requestor=requestor, requested=requested).first()
    friendRequest.delete() 
    return JsonResponse({"message": "Reply friend request success"}, status=201)
        

@csrf_exempt
@login_required(login_url="login")
def unfriendRequest(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)
    data = json.loads(request.body)
    requestor_id = data.get("requestor_id", "")
    requested_id = data.get("requested_id", "")
    requestor = User.objects.get(pk=requestor_id)
    requested = User.objects.get(pk=requested_id)
    requestor.friends.remove(requested)
    requested.friends.remove(requestor)
    return JsonResponse({"message": "unfriend success"}, status=201)


@csrf_exempt
@login_required(login_url="login")
def messageChatInfo(request, user_id, request_user_id):
    receive_user = User.objects.get(id=user_id)
    request_user = User.objects.get(id=request_user_id)
    user_list = [receive_user, request_user]
    chatbox = ChatBox.objects.all()
    for user in user_list:
        chatbox = chatbox.filter(users=user)
    chatbox = chatbox.first()
    return JsonResponse(chatbox.serialize(), status=201)
    

@csrf_exempt
@login_required(login_url="login")
def sendMessage(request, sender_id, receiver_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=201)
    data = json.loads(request.body)
    content = data.get("content","")  
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
    return message_chat_info(request, sender_id, receiver_id)


def loginView(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        # Check if authentication successful
        if user is not None:
            login(request, user)
            if 'next' in request.POST:
                return HttpResponseRedirect(request.POST['next'])
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logoutView(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })
        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
