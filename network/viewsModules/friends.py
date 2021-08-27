from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django import forms 
import json
import datetime
from ..models import *

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
    return messageChatInfo(request, sender_id, receiver_id)