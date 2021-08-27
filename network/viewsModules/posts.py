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


class PostCreateForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'image']

page_length = 2


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
