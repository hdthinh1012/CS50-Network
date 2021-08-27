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

class UserImageForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['image']
        labels = {
            "image": "",
        }


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