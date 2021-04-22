async function fetchSearchQuery(page_id, search_query){
    let response = await fetch(`/search_query/${search_query}/${page_id}`)
    let search_result = await response.json()
    return search_result;   
}

async function fetchUserInfo(user_id){
    let response = await fetch(`/get_user/${user_id}`)
    let user = await response.json()
    return user;
}

async function fetchPosts(type_post, page_id, ...user_id){
    let response = undefined;
    if (user_id.length == 0){
        response = await fetch(`/get_posts/${type_post}/${page_id}`)
    }    
    else{
        user_id = parseInt(user_id[0]);
        response = await fetch(`/get_posts/${type_post}/${page_id}/${user_id}`)
    }
    posts = await response.json();
    return posts;
}

async function fetchDeletePost(post){
    let response = await fetch(`/delete_post/${post.id}`,{
        method: "POST",
    })
    result = await response.json();
    return result;
}

async function fetchEditPost(post, div_post){
    let response = await fetch(`/edit_post`,{
        method: "POST",
        body: JSON.stringify({
            id: post.id,
            content: div_post.querySelector(".edit-content").value,
        }),
    })
    let result = await response.json();
    return result;
}

async function fetchSubmitComment(post, div_post){
    let response = await fetch(`/create_comment`,{
        method: "POST",
        body: JSON.stringify({
            content: div_post.querySelector('.comment-content').value,
            post_id: post.id,
        }),
    })
    let result = await response.json();
    return result;
}

async function fetchCreatePost(formdata){
    let response = await fetch('/create_post', { 
        method: 'POST', 
        body: formdata,
    });
    let result = await response.json();
    return result;
}

async function fetchEditUserImage(formdata){
    let response = await fetch(`/edit_user_image_fetch`,{
        method: "POST",
        body: formdata,
    })
    let result = await response.json();
    return result;
}

async function fetchToggleFollow(user_id, user, request_user){
    let response = await fetch(`get_user/${user_id}`,{
        method: "PUT",
        body: JSON.stringify({
            follower_id: document.querySelector('#request-user-id').value,
            followed_id: user_id,
            follow: user.followers.includes(request_user) ? "unfollow" : "follow",
        })
    })
    let result = await response.json();
    return result;
}


async function fetchToggleLikes(post, is_liked){
    let response = await fetch(`/edit_post`,{
        method: "PUT",
        body: JSON.stringify({
            liker_id: document.querySelector('#request-user-id').value,
            post_id: post.id,
            type: is_liked ? "unlike" : "like",
        })
    })
    let result = await response.json();
    return result;
}


// request_user_id: send message, user_id: receive message
// Send / Cancel friend request
async function fetchToggleFriendRequest(user_id, request_user_id, isFriendRequestSend){
    let response = await fetch(`toggle_friend_request/${request_user_id}/${user_id}`,{
        method: "PUT",
        body: JSON.stringify({
            isFriendRequestSend: isFriendRequestSend,
        })
    });
    let result = await response.json();
    return result;
}


// Reply friend request
async function fetchFriendRequestReply(requestor_id, requested_id, is_accept){
    let response = await fetch(`friend_request_reply`, {
        method: "POST",
        body: JSON.stringify({
            requestor_id: requestor_id,
            replier_id: requested_id,
            is_accept: is_accept,
        })
    })
    let result = await response.json()
    return result;
}


async function fetchUnFriendRequest(user_id, request_user_id){
    let response = await fetch(`unfriend_request`, {
        method: "POST",
        body: JSON.stringify({
            requestor_id: request_user_id,
            requested_id: user_id,
        })
    })
    let result = await response.json()
    return result;
}


async function fetchChatBox(user_id, request_user_id){
    let response = await fetch(`message_chat_info/${user_id}/${request_user_id}`)
    let result = await response.json();
    return result;
}


async function fetchSendMessage(receiver_id, sender_id, chatbox){
    let response = await fetch(`send_message/${sender_id}/${receiver_id}`,{
        method: "POST",
        body: JSON.stringify({
            content: document.querySelector('.chat-content').value,
        })
    })
    let result = await response.json();
    return result;
}